// Entry for make.fun's news-image-20261125: ship the page this repository holds.
//
// The picture is the broadsheet drawn by render7.py from our own scan of the day's wire
// feeds and committed as entry.png. This program is what the sandbox runs: it holds the
// committed bytes to the competition's gate (signature, every chunk's CRC, IHDR, size),
// writes them to $MAKEFUN_OUTPUT_DIR/entry.png, reads the copy back and prints the sha256
// of what it wrote. Two runs write the same bytes and print the same hash.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

const here = new URL(".", import.meta.url).pathname;
const png = readFileSync(join(here, "entry.png"));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// CRC32 over a buffer, as PNG defines it
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// 1. signature
const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (png.subarray(0, 8).compare(sig) !== 0) throw new Error("entry.png is not a PNG");

// 2. every chunk, end to end: length, type, data, CRC -- and IEND at the last byte
let at = 8;
let first = true;
let idat = [];
let sawPalette = false;
let width = 0;
let height = 0;
let depth = 0;
let colour = -1;
let sawEnd = false;
while (at + 12 <= png.length) {
  const len = png.readUInt32BE(at);
  const type = png.subarray(at + 4, at + 8).toString("latin1");
  if (at + 12 + len > png.length) throw new Error("truncated chunk " + type);
  const data = png.subarray(at + 8, at + 8 + len);
  const crc = png.readUInt32BE(at + 8 + len);
  const want = crc32(png.subarray(at + 4, at + 8 + len));
  if (crc !== want) throw new Error("bad CRC in " + type);
  if (first) {
    if (type !== "IHDR" || len !== 13) throw new Error("first chunk is not IHDR");
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    depth = data[8];
    colour = data[9];
    first = false;
  }
  if (type === "IDAT") idat.push(data);
  if (type === "PLTE") sawPalette = true;
  if (type === "IEND") {
    sawEnd = true;
    if (at + 12 + len !== png.length) throw new Error("bytes after IEND");
    break;
  }
  at += 12 + len;
}
if (first) throw new Error("no IHDR");
if (!sawEnd) throw new Error("no IEND");
if (!idat.length) throw new Error("no IDAT");

// 3. the gate's own limits: one 1024x1024 image of at most 1 MiB, 8-bit channels
if (width !== 1024 || height !== 1024) throw new Error(`size ${width}x${height} is not 1024x1024`);
if (depth !== 8) throw new Error("bit depth " + depth + " is not 8");
if (png.length > 1048576) throw new Error("entry.png is over 1 MiB");

// 4. the image data has to inflate to exactly the rows the header describes
const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colour];
if (channels === undefined) throw new Error("unknown colour type " + colour);
if (colour === 3 && !sawPalette) throw new Error("palette image without PLTE");
const raw = inflateSync(Buffer.concat(idat));
const rows = height * (1 + Math.ceil((width * channels * depth) / 8));
if (raw.length !== rows) throw new Error(`image data ${raw.length} B, header asks ${rows} B`);

// 5. write it, read it back, and print what landed
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
writeFileSync(dest, png);
const back = readFileSync(dest);
if (back.length !== png.length || back.compare(png) !== 0) throw new Error("copy differs");
const sha = createHash("sha256").update(back).digest("hex");
console.log(`entry.png ${width}x${height} ${png.length} B sha256 ${sha}`);


