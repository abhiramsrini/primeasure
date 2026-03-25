#!/usr/bin/env python3
"""Convert all PNG/JPG/JPEG images in images/ to WebP format.

Keeps originals untouched. Skips files that already have a .webp counterpart.
Usage: python3 scripts/convert_to_webp.py
"""

from pathlib import Path
from PIL import Image

QUALITY = 82  # Good balance of quality and file size
ROOT = Path(__file__).parent.parent
IMAGES_DIR = ROOT / "images"
EXTRA_FILES = [ROOT / "primeasure-logo.png"]
EXTENSIONS = {".png", ".jpg", ".jpeg"}


def convert(src: Path) -> tuple[int, int]:
    dst = src.with_suffix(".webp")
    if dst.exists():
        print(f"  skip (exists): {src.relative_to(ROOT)}")
        return 0, 0
    orig_size = src.stat().st_size
    try:
        with Image.open(src) as img:
            if img.mode in ("RGBA", "LA", "P"):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")
            img.save(dst, "WEBP", quality=QUALITY, method=6)
        new_size = dst.stat().st_size
        saved_pct = (1 - new_size / orig_size) * 100
        print(
            f"  OK  {src.relative_to(ROOT)}  "
            f"{orig_size // 1024}KB -> {new_size // 1024}KB  ({saved_pct:.0f}% saved)"
        )
        return orig_size, new_size
    except Exception as exc:
        print(f"  ERR {src}: {exc}")
        return 0, 0


def main():
    total_orig = total_new = count = 0
    sources = sorted(
        p for p in IMAGES_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in EXTENSIONS
    ) + [p for p in EXTRA_FILES if p.exists()]

    for src in sources:
        orig, new = convert(src)
        if orig:
            total_orig += orig
            total_new += new
            count += 1

    if count:
        reduction = (1 - total_new / total_orig) * 100
        print(
            f"\nDone: {count} images converted | "
            f"{total_orig / 1024 / 1024:.1f} MB -> {total_new / 1024 / 1024:.1f} MB "
            f"({reduction:.0f}% reduction)"
        )
    else:
        print("\nNo images converted.")


if __name__ == "__main__":
    main()
