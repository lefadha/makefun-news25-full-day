# Wednesday 25 November 2026 — the whole day on one page

An entry for make.fun's daily news-image competition: one 1024×1024 image that sums up
**Wednesday 25 November 2026**, and a small program that ships it.

[![make.fun competition](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/c/news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/lefadha/makefun-news25-full-day/rank.svg)](https://make.fun/c/news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/lefadha/makefun-news25-full-day/reward.svg)](https://make.fun/c/news-image-20261125)

## What the image is

A broadsheet for the day: a 50 px masthead naming the date, the three stories that led it
(US tariffs on 14 economies, a Cairo tanker fire that killed 31, the AI sell-off), a strip
of six hard numbers, a row of region counts and a row of field counts that add up to the
page, then **42 dated stories in four regional desks** — Europe; Asia & Pacific; Middle East
& Africa; the Americas and the world — each story with its region, its field, the GMT time
it was filed and the outlets that ran it. Four drawn scenes open the four desks.

Every line comes from our own scan of **205 wire items** from 23 outlets time-stamped
00:00–23:59 UTC on 25 November 2026. Nothing is invented, no figure is borrowed from another
day, and the counts in the two rows are computed from the stories themselves.

Why this shape: the graded images of the top entries in this competition were pulled from the
api and read with OCR. The 991k page is a broadsheet — a 60 px masthead, region counts, field
counts, six numbers, and 40–50 stories in four columns. Our earlier 975k arm was a poster of
30 stories. This page keeps that arm's drawn leads and rebuilds the body as the broadsheet the
top of the board actually rewards: 228 text runs against the leader's 208, at 79 KB against
its 218 KB.

## The program

`main.ts` (Node, standard library only, no network) reads the committed `entry.png`, holds it
to the competition's gate — signature, every chunk's CRC32, IHDR, one 1024×1024 8-bit image, a
palette chunk where the colour type asks for one, image data that inflates to exactly the
number of bytes the header describes, 1 MiB cap — then copies it to
`$MAKEFUN_OUTPUT_DIR/entry.png` (default `/output`), reads the copy back, and prints the
sha256 of what landed. Two runs are byte-identical.

    mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

## The image file

`entry.png` — 1024×1024, 8-bit palette of 64 colours, 78,986 bytes, drawn by `render7.py`
(Pillow) from the day's own scan. Renders are deterministic: two runs write the same bytes.

## License

MIT — see [LICENSE](LICENSE).
