
#!/usr/bin/env python3
"""
Pack a source-code directory into a searchable, syntax-highlighted PDF.

Limits:
  - PDF file size: 100 MB maximum
  - Estimated rendered raster size: 20 MB maximum

The rendered-size estimate uses RGB pages at the configured DPI.
It is an estimate, not a guarantee of every PDF viewer's memory usage.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import fitz  # PyMuPDF
from pygments import highlight
from pygments.lexers import get_lexer_for_filename, TextLexer
from pygments.formatters import HtmlFormatter
from pygments.util import ClassNotFound
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    PageBreak,
)
from xml.sax.saxutils import escape


# Adjust these if needed.
MAX_PDF_BYTES = 100 * 1024 * 1024
MAX_RENDERED_BYTES = 20 * 1024 * 1024
RENDER_DPI = 72

DEFAULT_EXCLUDED_DIRS = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".venv",
    "venv",
    "__pycache__",
    "coverage",
    ".idea",
    ".vscode",
}

DEFAULT_EXCLUDED_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
}

# Add or remove extensions as appropriate for your project.
DEFAULT_EXTENSIONS = {
    ".py", ".jsx", ".js", ".tsx", ".ts",
    ".json", ".html", ".css", ".scss",
    ".md", ".mdx", ".txt", ".yaml", ".yml",
    ".toml", ".xml", ".svg", ".sh",
    ".sql", ".java", ".c", ".h", ".cpp",
    ".hpp", ".rs", ".go", ".php",
    ".env.example", ".gitignore", ".dockerfile",
}


def collect_files(root: Path, extensions: set[str],
                  excluded_dirs: set[str],
                  include_all: bool) -> list[Path]:
    """Recursively collect files in deterministic order."""
    result = []

    for current, dirs, files in os.walk(root):
        dirs[:] = sorted(
            d for d in dirs
            if d not in excluded_dirs
        )

        for filename in sorted(files):
            path = Path(current) / filename

            if filename in DEFAULT_EXCLUDED_FILES:
                continue

            if not include_all and path.suffix.lower() not in extensions:
                # Include extensionless configuration files.
                if filename not in {
                    ".gitignore", ".dockerignore",
                    "Dockerfile", "Makefile",
                }:
                    continue

            if path.is_file():
                result.append(path)

    return sorted(result, key=lambda p: str(p).lower())


def read_source(path: Path, max_file_bytes: int) -> str:
    """Read source as UTF-8, with a fallback for unusual encodings."""
    size = path.stat().st_size

    if size > max_file_bytes:
        return (
            f"[Skipped: file is {size / 1024 / 1024:.2f} MB, "
            f"above the per-file limit.]"
        )

    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")


def lexer_for(path: Path):
    try:
        return get_lexer_for_filename(
            path.name,
            stripnl=False,
            ensurenl=False,
        )
    except ClassNotFound:
        return TextLexer(stripnl=False, ensurenl=False)


def build_pdf(root: Path, output: Path, files: list[Path],
              font_size: float, max_file_bytes: int) -> None:
    """Build a compact, searchable PDF."""
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "FileTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#174A75"),
        spaceAfter=5,
        wordWrap="CJK",
    )

    code_style = ParagraphStyle(
        "Code",
        fontName="Courier",
        fontSize=font_size,
        leading=font_size * 1.25,
        textColor=colors.HexColor("#222222"),
        alignment=TA_LEFT,
        leftIndent=0,
        rightIndent=0,
        spaceAfter=0,
        spaceBefore=0,
        splitLongWords=1,
        wordWrap="CJK",
    )

    # Pygments supplies highlighted HTML. We convert its spans into
    # ReportLab Paragraph markup, which supports colored inline text.
    formatter = HtmlFormatter(
        nowrap=True,
        style="friendly",
    )

    story = []

    story.append(Paragraph(
        f"Codebase export: {escape(str(root.resolve()))}",
        styles["Title"],
    ))
    story.append(Paragraph(
        f"{len(files)} files included",
        styles["Normal"],
    ))
    story.append(Spacer(1, 12))

    for index, path in enumerate(files):
        relative = path.relative_to(root).as_posix()

        if index:
            story.append(PageBreak())

        story.append(Paragraph(
            escape(relative),
            title_style,
        ))

        source = read_source(path, max_file_bytes)

        try:
            lexer = lexer_for(path)
            highlighted = highlight(source, lexer, formatter)
            # Pygments emits only span elements in nowrap mode.
            # Escape source content before placing it in PDF markup.
            import re

            pieces = re.split(r"(<span class=\"[^\"]+\">|</span>)",
                              highlighted)
            markup = []

            for piece in pieces:
                if piece.startswith('<span class="'):
                    token_class = re.search(
                        r'class="([^"]+)"', piece
                    ).group(1)
                    token_style = formatter.style
                    # Use Pygments' token style through the formatter CSS.
                    css = formatter.get_style_defs(".highlight")
                    match = re.search(
                        r"\." + re.escape(token_class)
                        + r"\s*\{([^}]+)\}", css
                    )
                    color = "#222222"

                    if match:
                        color_match = re.search(
                            r"color:\s*(#[0-9a-fA-F]{6})",
                            match.group(1),
                        )
                        if color_match:
                            color = color_match.group(1)

                    markup.append(f'<font color="{color}">')
                elif piece == "</span>":
                    markup.append("</font>")
                else:
                    # Preserve line breaks and spacing in code.
                    markup.append(escape(piece).replace("\n", "<br/>")
                                  .replace(" ", "&#160;")
                                  .replace("\t", "&#160;" * 4))

            story.append(Paragraph("".join(markup), code_style))

        except Exception as exc:
            # Fall back to plain source if syntax formatting fails.
            story.append(Preformatted(
                source,
                code_style,
                maxLineLength=100,
            ))
            print(f"Warning: plain-text fallback for {relative}: {exc}",
                  file=sys.stderr)

    doc = SimpleDocTemplate(
        str(output),
        pagesize=letter,
        rightMargin=0.45 * inch,
        leftMargin=0.45 * inch,
        topMargin=0.45 * inch,
        bottomMargin=0.45 * inch,
        title=f"Codebase: {root.name}",
        author="Codebase PDF exporter",
        pageCompression=1,
    )
    doc.build(story)


def estimate_rendered_size(pdf_path: Path, dpi: int) -> int:
    """
    Estimate the uncompressed RGB raster size of every page.
    Uses 3 bytes per pixel; ignores compression and viewer overhead.
    """
    total = 0

    with fitz.open(pdf_path) as pdf:
        scale = dpi / 72.0

        for page in pdf:
            rect = page.rect
            width = int(rect.width * scale + 0.999)
            height = int(rect.height * scale + 0.999)
            total += width * height * 3

    return total


def main():
    parser = argparse.ArgumentParser(
        description="Export a source-code directory to a PDF."
    )
    parser.add_argument("directory", type=Path,
                        help="Directory containing the codebase")
    parser.add_argument("-o", "--output", type=Path,
                        default=Path("codebase.pdf"),
                        help="Output PDF path (default: codebase.pdf)")
    parser.add_argument("--font-size", type=float, default=7.0,
                        help="Code font size in points (default: 7)")
    parser.add_argument("--dpi", type=int, default=RENDER_DPI,
                        help="DPI used for rendered-size estimate")
    parser.add_argument("--all-files", action="store_true",
                        help="Include all file types, not just source/config")
    parser.add_argument("--max-file-mb", type=float, default=5.0,
                        help="Skip individual files larger than this")
    parser.add_argument("--exclude", nargs="*", default=[],
                        help="Additional directory names to exclude")

    args = parser.parse_args()
    root = args.directory.resolve()
    output = args.output.resolve()

    if not root.is_dir():
        parser.error(f"Not a directory: {root}")

    if output == root or root in output.parents:
        parser.error("Output PDF must not be inside the source directory.")

    excluded = DEFAULT_EXCLUDED_DIRS | set(args.exclude)
    files = collect_files(
        root,
        DEFAULT_EXTENSIONS,
        excluded,
        args.all_files,
    )

    if not files:
        parser.error("No matching files found.")

    print(f"Found {len(files)} files.")
    print(f"Writing {output} ...")

    build_pdf(
        root,
        output,
        files,
        args.font_size,
        int(args.max_file_mb * 1024 * 1024),
    )

    pdf_bytes = output.stat().st_size
    rendered_bytes = estimate_rendered_size(output, args.dpi)

    print(f"\nPDF: {output}")
    print(f"Pages: {len(fitz.open(output))}")
    print(f"Actual size: {pdf_bytes / 1024 / 1024:.2f} MB")
    print(
        f"Estimated RGB raster size at {args.dpi} DPI: "
        f"{rendered_bytes / 1024 / 1024:.2f} MB"
    )

    errors = []

    if pdf_bytes > MAX_PDF_BYTES:
        errors.append("PDF exceeds the 100 MB actual-size limit.")

    if rendered_bytes >= MAX_RENDERED_BYTES:
        errors.append(
            "Estimated rendered size is 20 MB or higher. "
            "Try a lower --dpi value or split the export into multiple PDFs."
        )

    if errors:
        for error in errors:
            print(f"LIMIT WARNING: {error}", file=sys.stderr)
        sys.exit(1)

    print("Both size checks passed.")


if __name__ == "__main__":
    main()
