// Ship the front page this repository commits to /output/entry.png, and prove that the
// bytes which land are the bytes in the commit. Node 22, standard library only; the
// competition's sandbox has no network and does not promise a working directory, so every
// path is resolved from this file's own location.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The image is one 1024x1024 PNG drawn by render.py from the day's own wire scan: thirty
// stories of Wednesday 25 November 2026, 00:00-23:59 UTC, nine regions. This program does
// not draw it; it holds the committed file to the competition's gate and copies it, so a
// run is a byte copy and two runs are byte-identical.

import { mkdirSync, openSync, readFileSync, readSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32, inflateSync } from "node:zlib";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const SOURCE = join(HERE, "entry.png");
const MAX_BYTES = 1048576;
const SIDE = 1024;

function fail(why: string): never {
  console.error("entry refused: " + why);
  process.exit(1);
}

// --- the file is a whole PNG: signature, every chunk with its checksum, the image data its
// header describes. The gate reads exactly these bytes, so this checks exactly this file.
const bytes = readFileSync(SOURCE);
if (bytes.length > MAX_BYTES) fail(`file is ${bytes.length} B, cap is ${MAX_BYTES} B`);
if (bytes.length < 8 || bytes.readUInt32BE(0) !== 0x89504e47 || bytes.readUInt32BE(4) !== 0x0d0a1a0a) {
  fail("no PNG signature");
}

let at = 8;
let width = 0;
let height = 0;
let depth = 0;
let colour = 0;
let idat: Buffer[] = [];
let sawIhdr = false;
let sawIend = false;
while (at + 12 <= bytes.length) {
  const len = bytes.readUInt32BE(at);
  const type = bytes.toString("latin1", at + 4, at + 8);
  const body = bytes.subarray(at + 8, at + 8 + len);
  const crcAt = at + 8 + len;
  if (crcAt + 4 > bytes.length) fail(`chunk ${type} runs past the end of the file`);
  const want = bytes.readUInt32BE(crcAt);
  const got = crc32(Buffer.concat([Buffer.from(type, "latin1"), body])) >>> 0;
  if (want !== got) fail(`chunk ${type} checksum ${got} != ${want}`);
  if (type === "IHDR") {
    sawIhdr = true;
    width = body.readUInt32BE(0);
    height = body.readUInt32BE(4);
    depth = body[8];
    colour = body[9];
  } else if (type === "IDAT") {
    idat.push(body);
  } else if (type === "IEND") {
    sawIend = true;
    at = crcAt + 4;
    break;
  }
  at = crcAt + 4;
}
if (!sawIhdr || !sawIend) fail("missing IHDR or IEND");
if (width > SIDE || height > SIDE || width === 0 || height === 0) {
  fail(`image is ${width}x${height}, the cap is ${SIDE}x${SIDE}`);
}
if (depth !== 8) fail(`bit depth ${depth}, expected 8`);

// the pixel data must inflate to exactly one filter byte and one pixel row per row; a
// palette image (colour type 3) carries one index per pixel at this bit depth, not one bit
const channels = colour === 0 ? 1 : colour === 2 ? 3 : colour === 3 ? 1 : colour === 4 ? 2 : 4;
const rowBytes = Math.ceil((width * channels * depth) / 8);
const rows = height * (1 + rowBytes);
let raw: Buffer;
try {
  raw = inflateSync(Buffer.concat(idat));
} catch (e) {
  fail("image data does not inflate: " + (e as Error).message);
}
if (raw.length !== rows) fail(`image data is ${raw.length} B, header says ${rows} B`);

// --- copy, then read the copy back: the bytes that land must be the bytes committed
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.png");
writeFileSync(target, bytes);
const landed = readFileSync(target);
if (!landed.equals(bytes)) fail("the written file differs from the committed one");
if (statSync(target).size !== bytes.length) fail("the written file is a different size");
// a second write has to land the same bytes, so the run is repeatable
const first = readFileSync(target);
writeFileSync(target, bytes);
if (!readFileSync(target).equals(first)) fail("two writes of the same bytes differ");

// --- a quick read of the head of the file, so a truncated copy cannot pass silently
const fd = openSync(target, "r");
const head = Buffer.alloc(33);
readSync(fd, head, 0, 33, 0);
if (head.readUInt32BE(16) !== width || head.readUInt32BE(20) !== height) {
  fail("the copied file's header does not name the size that was checked");
}

console.log(
  `entry.png ${bytes.length} B, ${width}x${height}, colour type ${colour}, ` +
    `idat ${idat.length} chunk(s), ${raw.length} B of pixels -> ${target}`,
);
