"""Generate the docs-as-code intro video (30s) from the beat sheet."""

from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1280, 720
FPS = 24
OUT = Path(__file__).resolve().parents[1] / "frontend" / "public" / "media" / "intro" / "intro.mp4"

INK = (21, 32, 43)
INK_SOFT = (61, 79, 95)
PAPER = (245, 248, 251)
CARD = (255, 255, 255)
TEAL = (11, 110, 110)
TEAL_SOFT = (219, 236, 236)
COPPER = (184, 92, 56)
LINE = (210, 218, 226)
GREEN = (34, 140, 100)
RED_SOFT = (180, 70, 60)

BEATS = [
    {
        "duration": 4.0,
        "caption": "Plan docs with the feature — this sprint",
        "stage": "PLAN",
        "kind": "plan",
    },
    {
        "duration": 6.0,
        "caption": "Draft in Git. Verify against the source.",
        "stage": "WRITE",
        "kind": "write",
    },
    {
        "duration": 6.0,
        "caption": "Review the PR. Checks catch what eyes miss.",
        "stage": "REVIEW",
        "kind": "review",
    },
    {
        "duration": 6.0,
        "caption": "Publish with the release",
        "stage": "PUBLISH",
        "kind": "publish",
    },
    {
        "duration": 4.0,
        "caption": "Observe what shipped. Improve the next pass.",
        "stage": "OBSERVE",
        "kind": "observe",
    },
    {
        "duration": 4.0,
        "caption": "Plan → Write → Review → Publish → Observe — try it on real GitHub",
        "stage": "PLAYGROUND",
        "kind": "cta",
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, box, fill, radius=18, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=font_obj) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [text]


def draw_chrome(draw: ImageDraw.ImageDraw, stage: str):
    rounded_rect(draw, (48, 40, WIDTH - 48, HEIGHT - 40), CARD, radius=28, outline=LINE, width=2)
    draw.ellipse((72, 62, 92, 82), fill=(255, 120, 120))
    draw.ellipse((104, 62, 124, 82), fill=(255, 190, 80))
    draw.ellipse((136, 62, 156, 82), fill=(90, 190, 120))
    badge = f"Docs as Code  ·  {stage}"
    draw.text((188, 58), badge, fill=TEAL, font=font(22, bold=True))


def draw_caption(draw: ImageDraw.ImageDraw, caption: str):
    bar_top = HEIGHT - 150
    rounded_rect(draw, (88, bar_top, WIDTH - 88, HEIGHT - 70), (21, 32, 43), radius=16)
    title_font = font(28, bold=True)
    lines = wrap_text(draw, caption, title_font, WIDTH - 220)
    y = bar_top + 28
    for line in lines[:2]:
        tw = draw.textlength(line, font=title_font)
        draw.text(((WIDTH - tw) / 2, y), line, fill=(255, 255, 255), font=title_font)
        y += 36


def draw_plan(img: Image.Image, draw: ImageDraw.ImageDraw):
    rounded_rect(draw, (120, 130, WIDTH - 120, 470), PAPER, radius=20, outline=LINE, width=2)
    draw.text((160, 160), "GitHub Issue", fill=INK_SOFT, font=font(20))
    draw.text((160, 200), "Auth API — docs needed this sprint", fill=INK, font=font(34, bold=True))
    draw.text((160, 260), "Opened in sprint planning  ·  label: docs", fill=TEAL, font=font(22))
    for i, item in enumerate(
        [
            "Audience: developers integrating the auth API",
            "Deliverable: quick start + sessions reference",
            "Success: ships with the release, not after",
        ]
    ):
        y = 320 + i * 42
        draw.ellipse((168, y + 8, 184, y + 24), fill=TEAL)
        draw.text((204, y), item, fill=INK, font=font(22))


def draw_write(img: Image.Image, draw: ImageDraw.ImageDraw):
    rounded_rect(draw, (120, 130, 610, 470), PAPER, radius=18, outline=LINE, width=2)
    rounded_rect(draw, (670, 130, WIDTH - 120, 470), PAPER, radius=18, outline=LINE, width=2)
    draw.text((148, 150), "sessions.md", fill=TEAL, font=font(20, bold=True))
    draw.text((698, 150), "sessions.js", fill=COPPER, font=font(20, bold=True))
    left_lines = [
        "## Create a session",
        "",
        "Send a POST request to",
        "`/sessions` with email and",
        "password.",
        "",
        "limit — required",
    ]
    right_lines = [
        "app.post('/sessions', …)",
        "if (!limit) {",
        "  return 400",
        "  'limit is required'",
        "}",
        "",
        "// verified against source",
    ]
    for i, line in enumerate(left_lines):
        draw.text((148, 200 + i * 30), line, fill=INK, font=font(20))
    for i, line in enumerate(right_lines):
        color = GREEN if "verified" in line else INK
        draw.text((698, 200 + i * 30), line, fill=color, font=font(20))
    rounded_rect(draw, (420, 430, 860, 478), TEAL_SOFT, radius=12)
    draw.text((460, 442), "Accuracy fix applied in the branch", fill=TEAL, font=font(20, bold=True))


def draw_review(img: Image.Image, draw: ImageDraw.ImageDraw):
    rounded_rect(draw, (120, 130, WIDTH - 120, 470), PAPER, radius=20, outline=LINE, width=2)
    draw.text((160, 155), "Pull request  ·  docs/sessions", fill=INK, font=font(28, bold=True))
    checks = [
        ("Link check", True),
        ("Vale style", True),
        ("Instruction consistency", True),
        ("Endpoint accuracy", True),
    ]
    for i, (name, ok) in enumerate(checks):
        y = 220 + i * 48
        color = GREEN if ok else RED_SOFT
        mark = "PASS" if ok else "FAIL"
        rounded_rect(draw, (160, y, WIDTH - 160, y + 40), (255, 255, 255), radius=10, outline=LINE)
        draw.text((180, y + 8), f"{mark}  {name}", fill=color, font=font(22, bold=True))
    draw.text((160, 420), "Reviewer: checked against implementation", fill=TEAL, font=font(22, bold=True))


def draw_publish(img: Image.Image, draw: ImageDraw.ImageDraw):
    rounded_rect(draw, (120, 130, WIDTH - 120, 470), PAPER, radius=20, outline=LINE, width=2)
    draw.text((160, 170), "Publish pipeline", fill=INK, font=font(28, bold=True))
    stages = ["Checks", "Review gate", "Publish", "Release"]
    x = 180
    for i, name in enumerate(stages):
        rounded_rect(draw, (x, 250, x + 200, 330), TEAL if i < 3 else GREEN, radius=14)
        tw = draw.textlength(name, font=font(22, bold=True))
        draw.text((x + (200 - tw) / 2, 278), name, fill=(255, 255, 255), font=font(22, bold=True))
        if i < len(stages) - 1:
            draw.polygon([(x + 210, 280), (x + 230, 290), (x + 210, 300)], fill=INK_SOFT)
        x += 250
    draw.text((160, 390), "Docs published with the release", fill=GREEN, font=font(26, bold=True))


def draw_observe(img: Image.Image, draw: ImageDraw.ImageDraw):
    rounded_rect(draw, (120, 130, WIDTH - 120, 470), PAPER, radius=20, outline=LINE, width=2)
    draw.text((160, 160), "Publish history", fill=INK, font=font(28, bold=True))
    rows = [
        ("sessions reference", "passed · reviewed"),
        ("quick start", "passed · watermarked"),
        ("follow-up issue", "opened for next sprint"),
    ]
    for i, (left, right) in enumerate(rows):
        y = 230 + i * 60
        rounded_rect(draw, (160, y, WIDTH - 160, y + 48), (255, 255, 255), radius=12, outline=LINE)
        draw.text((184, y + 12), left, fill=INK, font=font(22))
        tw = draw.textlength(right, font=font(20, bold=True))
        draw.text((WIDTH - 184 - tw, y + 14), right, fill=TEAL, font=font(20, bold=True))


def draw_cta(img: Image.Image, draw: ImageDraw.ImageDraw):
    draw.text((160, 180), "SR's Docs as Code Playground", fill=TEAL, font=font(36, bold=True))
    draw.text((160, 250), "Operate the real workflow", fill=INK, font=font(42, bold=True))
    flow = "PLAN  →  WRITE  →  REVIEW  →  PUBLISH  →  OBSERVE"
    tw = draw.textlength(flow, font=font(24, bold=True))
    draw.text(((WIDTH - tw) / 2, 340), flow, fill=INK_SOFT, font=font(24, bold=True))
    rounded_rect(draw, (430, 400, 850, 470), TEAL, radius=16)
    label = "Explore the workflow"
    tw = draw.textlength(label, font=font(26, bold=True))
    draw.text(((WIDTH - tw) / 2, 420), label, fill=(255, 255, 255), font=font(26, bold=True))


DRAWERS = {
    "plan": draw_plan,
    "write": draw_write,
    "review": draw_review,
    "publish": draw_publish,
    "observe": draw_observe,
    "cta": draw_cta,
}


def render_frame(kind: str, stage: str, caption: str) -> np.ndarray:
    img = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(img)
    # soft washes
    for cx, cy, color, r in [
        (1100, 80, (220, 236, 236), 260),
        (80, 160, (242, 226, 218), 220),
    ]:
        wash = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        wash_draw = ImageDraw.Draw(wash)
        wash_draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, 90))
        img = Image.alpha_composite(img.convert("RGBA"), wash).convert("RGB")
        draw = ImageDraw.Draw(img)

    draw_chrome(draw, stage)
    DRAWERS[kind](img, draw)
    draw_caption(draw, caption)
    return np.asarray(img)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frames: list[np.ndarray] = []
    # cache one frame per beat (static cards; duration via repetition)
    for beat in BEATS:
        frame = render_frame(beat["kind"], beat["stage"], beat["caption"])
        count = max(1, int(beat["duration"] * FPS))
        frames.extend([frame] * count)

    print(f"Writing {len(frames)} frames ({len(frames) / FPS:.1f}s) -> {OUT}")
    imageio.mimwrite(OUT, frames, fps=FPS, codec="libx264", quality=7, macro_block_size=1)
    print(f"Done: {OUT.stat().st_size / 1_000_000:.2f} MB")


if __name__ == "__main__":
    main()
