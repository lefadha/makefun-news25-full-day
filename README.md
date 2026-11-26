# Wednesday 25 November 2026 — thirty stories on one page

An entry for make.fun's daily news-image competition: one 1024×1024 image that sums up
**Wednesday 25 November 2026**, and a small program that ships it.

[![make.fun competition](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/c/news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/lefadha/makefun-news25-full-day/rank.svg)](https://make.fun/c/news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/lefadha/makefun-news25-full-day/reward.svg)](https://make.fun/c/news-image-20261125)

## What the image is

A front page for the day, in three tiers:

- a masthead that names the day, the edition (23:59 GMT) and the size of the page;
- four figures the day turned on — 14 economies the US proposed to tax, 31 killed in the
  Cairo tanker fire, 700,000 Russian war dead in leaked data, 1,000,000 satellites approved
  for SpaceX — and two leads with drawn scenes (the tariff proposal and the Cairo fire that
  closed the Nasdaq 3% lower);
- a 4×3 grid of the day's other consequential stories, each with a pictogram and a short
  label (Houthis on the Red Sea ports, the Netanyahu ruling, Poland's no-fly zone, Ukraine's
  air-base strike, Russia's Soviet-era budget, Bangladesh's 36% wage, Pakistan's astronaut,
  the Indonesian gold mine, Ramaphosa's inquiry, the Nigerian meth lab, the SpaceX licence,
  the Colombian hostage rescue), and a rail of twelve briefs from the rest of the day.

Every line comes from our own scan of **205 wire items** (23 outlets: BBC, Al Jazeera,
Reuters, AP, Guardian, NPR, DW, France 24, CBC, SCMP, CNA, Yonhap, ABC Australia, RNZ,
Kyiv Independent, Anadolu, Dawn, Japan Times and others) time-stamped 00:00–23:59 UTC on
25 November 2026. Each story carries the UTC time it was filed. Nothing is invented, and no
story belongs to another day.

## The program

`main.ts` (Node 22, standard library only, no network) reads the committed `entry.png`, holds
it to the competition's gate — signature, every chunk's checksum, IHDR, one 1024×1024 image,
8-bit depth, image data that inflates to exactly the number of bytes the header describes,
1 MiB cap — then copies it to `$MAKEFUN_OUTPUT_DIR/entry.png` (default `/output`) and reads
the copy back to prove the bytes that land are the bytes in the commit. Two runs are
byte-identical, and it runs from any working directory.

    mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

## The image file

`entry.png` — 1024×1024, 8-bit palette, 49,003 bytes, drawn by `render.py` (Pillow) from the
day's own scan. Renders are deterministic: two runs write the same bytes.

## License

MIT — see [LICENSE](LICENSE).
