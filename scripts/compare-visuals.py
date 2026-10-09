from pathlib import Path
from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT / "artifacts" / "visual-compare"
REPORT_PATH = ROOT / "docs" / "refactor" / "html-visual-diff.md"
PAGES = (
    "login",
    "workbench",
    "ledger",
    "input",
    "detail",
    "schedule",
    "warning",
    "gis",
    "analysis",
    "admin",
)
PIXEL_THRESHOLD = 16


def compare(page: str) -> tuple[float, int, int]:
    html = Image.open(ARTIFACT_DIR / f"{page}-html.png").convert("RGB")
    vue = Image.open(ARTIFACT_DIR / f"{page}-vue.png").convert("RGB")
    if html.size != vue.size:
        raise ValueError(f"{page} 截图尺寸不一致：HTML={html.size}，Vue={vue.size}")

    difference = ImageChops.difference(html, vue)
    mask = difference.convert("L").point(lambda value: 255 if value > PIXEL_THRESHOLD else 0)
    changed_pixels = sum(1 for value in mask.getdata() if value)
    total_pixels = html.width * html.height

    overlay = vue.copy()
    highlight = Image.new("RGB", vue.size, (229, 57, 53))
    overlay.paste(highlight, mask=mask)
    Image.blend(vue, overlay, 0.55).save(ARTIFACT_DIR / f"{page}-diff.png")
    return changed_pixels / total_pixels, changed_pixels, total_pixels


def main() -> None:
    rows = []
    for page in PAGES:
        ratio, changed, total = compare(page)
        status = "通过" if ratio <= 0.015 else "待整改"
        rows.append((page, ratio, changed, total, status))

    lines = [
        "# HTML 与 Vue 核心页面视觉差异报告",
        "",
        "生成条件：Edge、1920×1080、DPR=1；颜色差异阈值为 16。",
        "该报告用于量化整改，不会自动更新 HTML 真值或 Vue 防回退基线。",
        "",
        "| 页面 | 差异率 | 差异像素 / 总像素 | 1.5% 阈值 |",
        "|---|---:|---:|---|",
    ]
    lines.extend(
        f"| {page} | {ratio:.2%} | {changed:,} / {total:,} | {status} |"
        for page, ratio, changed, total, status in rows
    )
    lines.extend(
        [
            "",
            "截图与差异图位于 `artifacts/visual-compare/`，该目录为本地验收产物，不提交版本库。",
            "",
        ]
    )
    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
