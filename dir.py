#!/usr/bin/env python3
"""
dump_code_with_tree.py

Save *all* source files (wrapped with BOF/EOF) plus an ASCII directory tree
into an *output* directory.

Usage
-----
python dump_code_with_tree.py <SOURCE_DIR> <OUTPUT_DIR>
"""

import argparse
from pathlib import Path
from typing import Iterable

# ───── file types we treat as “code” ──────────────────────────────────────────
TEXT_EXTENSIONS = {
    ".py", ".java", ".js", ".ts", ".jsx", ".tsx",
    ".c", ".cpp", ".h", ".hpp",
    ".rb", ".go", ".rs", ".php",
    ".html", ".css", ".scss", ".md",
    ".yaml", ".yml", ".json", ".xml", ".sql",
}

# ───── folders to exclude ─────────────────────────────────────────────────────
EXCLUDED_DIRS = {"node_modules", ".git", "__pycache__"}

# ───── helpers ────────────────────────────────────────────────────────────────
def iter_code_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS:
            yield path


def safe_read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


# ASCII-tree drawing constants
TREE_BRANCH, TREE_LAST, TREE_PIPE, TREE_BLANK = "├── ", "└── ", "│   ", "    "

def build_tree(root: Path) -> str:
    lines = [root.name + "/"]

    def _walk(folder: Path, prefix: str = ""):
        entries = sorted(
            [e for e in folder.iterdir() if e.name not in EXCLUDED_DIRS],
            key=lambda p: (p.is_file(), p.name.lower())
        )
        for idx, entry in enumerate(entries):
            conn = TREE_LAST if idx == len(entries) - 1 else TREE_BRANCH
            lines.append(f"{prefix}{conn}{entry.name}" + ("/" if entry.is_dir() else ""))
            if entry.is_dir():
                _walk(entry, prefix + (TREE_BLANK if conn == TREE_LAST else TREE_PIPE))

    _walk(root)
    return "\n".join(lines)


# ───── main ───────────────────────────────────────────────────────────────────
def main() -> None:
    ap = argparse.ArgumentParser(description="Dump code files + tree into OUTPUT_DIR")
    ap.add_argument("source_dir", type=Path, help="root directory to scan")
    ap.add_argument("output_dir", type=Path, help="where to write code_dump.txt and tree.txt")
    args = ap.parse_args()

    src: Path = args.source_dir.resolve()
    out_dir: Path = args.output_dir.resolve()

    if not src.is_dir():
        ap.error(f"{src} is not a directory.")
    out_dir.mkdir(parents=True, exist_ok=True)

    # ---- write code_dump.txt ----
    dump_path = out_dir / "code_dump.txt"
    with dump_path.open("w", encoding="utf-8") as fh:
        for file in iter_code_files(src):
            rel = file.relative_to(src)
            content = safe_read(file)
            fh.write(f"BOF: {rel}\n")
            fh.write(content)
            if not content.endswith("\n"):
                fh.write("\n")
            fh.write(f"EOF: {rel}\n\n")
    print(f"✅  Code dumped to {dump_path}")

    # ---- write tree.txt ----
    tree_path = out_dir / "tree.txt"
    tree_path.write_text(build_tree(src), encoding="utf-8")
    print(f"✅  Directory tree written to {tree_path}")


if __name__ == "__main__":
    main()
