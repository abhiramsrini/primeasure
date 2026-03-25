#!/usr/bin/env python3
"""Update image references from .png/.jpg/.jpeg to .webp in HTML, JS, and JSON files.

Only replaces a reference when the corresponding .webp file actually exists,
so files whose WebP was removed (because it was larger) keep the original extension.

Usage: python3 scripts/update_image_refs.py
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
IMAGES_DIR = ROOT / "images"

# File types to process
FILE_GLOBS = ["**/*.html", "**/*.json", "js/*.js"]

# Dirs to skip (generated output will be re-generated from templates)
SKIP_DIRS = {"blog", "events"}

# Match image paths that contain "images/" (relative or absolute-looking)
# Captures: (path_without_extension)(extension)
IMG_PATTERN = re.compile(
    r'((?:\.\.\/|\/)*(?:[a-zA-Z0-9_\-]+\/)*images\/[a-zA-Z0-9_\-\.\/]+?)'
    r'\.(png|jpg|jpeg|PNG|JPG|JPEG)'
    r'(?=["\'\s,\)>\?#]|$)',
    re.IGNORECASE,
)


def webp_exists(path_str: str) -> bool:
    """Return True if a .webp counterpart exists for the given image path."""
    if "images/" not in path_str:
        return False
    after_images = path_str.split("images/")[-1]
    return (IMAGES_DIR / (after_images + ".webp")).exists()


def process_file(file_path: Path) -> int:
    """Replace image extensions with .webp where WebP counterpart exists.
    Returns the number of substitutions made."""
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as exc:
        print(f"  ERR reading {file_path}: {exc}")
        return 0

    replacements = 0

    def replacer(m: re.Match) -> str:
        nonlocal replacements
        path_no_ext = m.group(1)
        if webp_exists(path_no_ext):
            replacements += 1
            return path_no_ext + ".webp"
        return m.group(0)  # keep original if no webp

    new_content = IMG_PATTERN.sub(replacer, content)

    if replacements:
        file_path.write_text(new_content, encoding="utf-8")
        print(f"  {file_path.relative_to(ROOT)}  ({replacements} refs updated)")

    return replacements


def main():
    total_files = total_refs = 0

    for glob in FILE_GLOBS:
        for file_path in sorted(ROOT.glob(glob)):
            # Skip generated output directories
            parts = file_path.relative_to(ROOT).parts
            if parts[0] in SKIP_DIRS:
                continue
            refs = process_file(file_path)
            if refs:
                total_files += 1
                total_refs += refs

    print(f"\nDone: {total_refs} references updated across {total_files} files")
    print("Note: blog/ and events/ are skipped — regenerate with:")
    print("  python3 scripts/generate_blog_pages.py")
    print("  python3 scripts/generate_events_page.py")


if __name__ == "__main__":
    main()
