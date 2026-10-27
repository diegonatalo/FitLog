"""Gera os SVGs do README a partir de theme.json e content.json.

Uso: python docs/assets/build.py  (requer Pillow para embutir os prints)
"""
import base64
import io
import json
import textwrap
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image

HERE = Path(__file__).resolve().parent
SHOTS = HERE.parent / "screenshots"
T = json.loads((HERE / "theme.json").read_text(encoding="utf-8"))
C = json.loads((HERE / "content.json").read_text(encoding="utf-8"))

SANS, MONO = T["fontSans"].replace('"', "'"), T["fontMono"].replace('"', "'")
GLOW = T["glow"] and T["grid"]
ANIM = T["animations"]


def write(name, svg):
    (HERE / name).write_text(svg, encoding="utf-8")


def head(w, h, title, extra=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
        f'role="img" aria-label="{escape(title)}"><title>{escape(title)}</title>{extra}'
    )


def grad(id_, x1="0", y1="0", x2="1", y2="0"):
    return (
        f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
        f'<stop offset="0" stop-color="{T["accent"]}"/><stop offset="1" stop-color="{T["accent2"]}"/></linearGradient>'
    )


def radial(id_, color, op):
    return (
        f'<radialGradient id="{id_}"><stop offset="0" stop-color="{color}" stop-opacity="{op}"/>'
        f'<stop offset="1" stop-color="{color}" stop-opacity="0"/></radialGradient>'
    )


def jpeg_uri(img, width, q=80):
    img = img.convert("RGB")
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=q, optimize=True)
    assert buf.tell() <= 200 * 1024, "imagem acima de 200 KB"
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode(), img.size


def dots(x, y):
    cols = ["#ff8a7a", "#f5d36a", T["accent"]]
    return "".join(f'<circle cx="{x + i * 14}" cy="{y}" r="4" fill="{c}"/>' for i, c in enumerate(cols))


def chip_w(label):
    return 0.6 * 13 * len(label) + 38


def chip(x, y, label, i):
    w = chip_w(label)
    col = T["accent"] if i % 2 == 0 else T["accent2"]
    return (
        f'<rect x="{x}" y="{y}" width="{w:.1f}" height="32" rx="16" fill="{T["bg"]}" stroke="{T["borderStrong"]}"/>'
        f'<circle cx="{x + 17}" cy="{y + 16}" r="3.5" fill="{col}"/>'
        f'<text x="{x + 29}" y="{y + 21}" font-family="{MONO}" font-size="13" fill="{T["fg"]}">{escape(label)}</text>'
    )


# ---------------------------------------------------------------- banner
def banner():
    name, repo = C["name"], C["repo"]
    pill = f"github.com/diegonatalo/{repo}".upper()
    pill_w = len(pill) * 13 * 0.6 + 1.8 * len(pill) + 56
    big = ""
    if " " in name:
        first, last = name.rsplit(" ", 1)
        big = (
            f'<text x="72" y="196" font-family="{SANS}" font-size="98" font-weight="800" letter-spacing="-3" fill="{T["fg"]}">'
            f'{escape(first)} <tspan fill="url(#g)">{escape(last)}</tspan></text>'
        )
    else:
        big = (
            f'<text x="72" y="196" font-family="{SANS}" font-size="98" font-weight="800" letter-spacing="-3" fill="{T["fg"]}">{escape(name)}</text>'
        )
    tag = "".join(
        f'<text x="72" y="{296 + 28 * i}" font-family="{SANS}" font-size="20" fill="{T["muted"]}">{escape(l)}</text>'
        for i, l in enumerate(textwrap.wrap(C["tagline"], 42)[:2])
    )
    chips, x = "", 72
    for i, s in enumerate(C["stack"][:5]):
        chips += chip(x, 362, s, i)
        x += chip_w(s) + 10

    anim_css = (
        "<style>.pulse{animation:p 2.4s ease-in-out infinite}@keyframes p{50%{opacity:.35}}"
        ".d1{animation:a 15s ease-in-out infinite alternate}.d2{animation:b 16s ease-in-out infinite alternate}"
        "@keyframes a{to{transform:translate(60px,30px)}}@keyframes b{to{transform:translate(-60px,-24px)}}</style>"
        if ANIM
        else ""
    )
    bg = f'<rect width="1200" height="470" fill="{T["bg"]}"/>'
    if GLOW:
        bg += (
            f'<g class="d1"><circle cx="170" cy="40" r="330" fill="url(#ga)"/></g>'
            f'<g class="d2"><circle cx="1040" cy="420" r="380" fill="url(#gb)"/></g>'
        )
    if T["grid"]:
        bg += '<rect width="1200" height="470" fill="url(#grid)"/>'

    shot_img = Image.open(SHOTS / "inicio.png")
    crop = shot_img.crop((0, 0, shot_img.width, round(shot_img.width * 290 / 366)))
    uri, _ = jpeg_uri(crop, 732)
    frame = (
        f'<rect x="770" y="58" width="366" height="318" rx="20" fill="{T["card"]}" stroke="{T["borderStrong"]}"/>'
        f'{dots(794, 72)}'
        f'<text x="953" y="76" text-anchor="middle" font-family="{MONO}" font-size="12" fill="{T["subtle"]}">inicio</text>'
        f'<image x="770" y="86" width="366" height="290" preserveAspectRatio="xMidYMin slice" href="{uri}" clip-path="url(#fc)"/>'
        f'<line x1="770" y1="86" x2="1136" y2="86" stroke="{T["borderStrong"]}"/>'
    )
    svg = head(
        1200, 470, f"{name}: {C['tagline']}",
        f'<defs>{grad("g")}{radial("ga", T["accent"], 0.26)}{radial("gb", T["accent2"], 0.26)}'
        f'<pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="{T["fg"]}" stroke-opacity="0.045"/></pattern>'
        f'<clipPath id="r"><rect width="1200" height="470" rx="26"/></clipPath>'
        f'<clipPath id="fc"><path d="M770 86H1136V356a20 20 0 0 1-20 20H790a20 20 0 0 1-20-20Z"/></clipPath>{anim_css}</defs>'
    )
    svg += f'<g clip-path="url(#r)">{bg}'
    svg += (
        f'<rect x="72" y="62" width="{pill_w:.0f}" height="36" rx="18" fill="{T["accent"]}" fill-opacity="0.1" stroke="{T["accent"]}" stroke-opacity="0.38"/>'
        f'<circle class="pulse" cx="94" cy="80" r="4" fill="{T["accent"]}"/>'
        f'<text x="108" y="85" font-family="{MONO}" font-size="13" letter-spacing="1.8" fill="{T["accent"]}">{escape(pill)}</text>'
        f'{big}{tag}{chips}{frame}</g>'
        f'<rect x="0.5" y="0.5" width="1199" height="469" rx="26" fill="none" stroke="{T["borderStrong"]}"/></svg>'
    )
    write("banner.svg", svg)


# --------------------------------------------------------------- botões
def button(file, label, primary, w=None):
    text = f"{label} ↗"
    w = w or round(len(text) * 9.6 + 64)
    if primary:
        bg = f'<rect width="{w}" height="52" rx="26" fill="url(#g)"/>'
        col = T["onAccent"]
    else:
        bg = f'<rect x="0.75" y="0.75" width="{w - 1.5}" height="50.5" rx="25.25" fill="{T["card"]}" stroke="{T["borderStrong"]}" stroke-width="1.5"/>'
        col = T["fg"]
    svg = head(w, 52, text, f"<defs>{grad('g')}</defs>")
    svg += (
        f'{bg}<text x="{w / 2}" y="32" text-anchor="middle" font-family="{SANS}" font-size="16" '
        f'font-weight="{700 if primary else 600}" fill="{col}">{escape(text)}</text></svg>'
    )
    write(file, svg)


# ----------------------------------------------------------- cabeçalhos
def section_header(idx, s):
    label = f"{idx:02d} · {s['tag']}"
    pw = len(label) * 9.4 + 34
    svg = head(
        1000, 124, f"{label}: {s['title']}",
        f'<defs>{grad("g")}{radial("ga", T["accent2"], 0.16)}{radial("gb", T["accent"], 0.16)}</defs>',
    )
    svg += (
        f'<rect width="1000" height="124" rx="22" fill="{T["bg"]}"/>'
        f'<circle cx="980" cy="0" r="200" fill="url(#ga)"/><circle cx="0" cy="124" r="200" fill="url(#gb)"/>'
        f'<rect x="0.5" y="0.5" width="999" height="123" rx="21.5" fill="none" stroke="{T["borderStrong"]}"/>'
        f'<rect x="40" y="26" width="{pw:.0f}" height="28" rx="14" fill="{T["accent"]}" fill-opacity="0.1" stroke="{T["accent"]}" stroke-opacity="0.38"/>'
        f'<text x="{40 + pw / 2:.0f}" y="45" text-anchor="middle" font-family="{MONO}" font-size="12" letter-spacing="1.6" fill="{T["accent"]}">{escape(label)}</text>'
        f'<text x="40" y="94" font-family="{SANS}" font-size="36" font-weight="800" letter-spacing="-0.8" fill="{T["fg"]}">{escape(s["title"])}</text>'
        f'<rect x="40" y="106" width="64" height="3" rx="1.5" fill="url(#g)"/></svg>'
    )
    write(f"h-{s['id']}.svg", svg)


# ---------------------------------------------------------------- cards
def feature_card(i, title, desc):
    lines = textwrap.wrap(desc, 54)[:5]
    body = "".join(
        f'<text x="32" y="{116 + 22 * k}" font-family="{SANS}" font-size="14.5" fill="{T["muted"]}">{escape(l)}</text>'
        for k, l in enumerate(lines)
    )
    svg = head(
        490, 290, f"Funcionalidade {i:02d}: {title}. {desc}",
        f'<defs>{grad("g")}{radial("ga", T["accent"], 0.18)}<clipPath id="c"><rect width="490" height="290" rx="22"/></clipPath></defs>',
    )
    svg += (
        f'<g clip-path="url(#c)"><rect width="490" height="290" fill="{T["card"]}"/>'
        f'<circle cx="490" cy="0" r="190" fill="url(#ga)"/><rect width="490" height="4" fill="url(#g)"/></g>'
        f'<rect x="0.5" y="0.5" width="489" height="289" rx="21.5" fill="none" stroke="{T["borderStrong"]}"/>'
        f'<text x="32" y="44" font-family="{MONO}" font-size="12" letter-spacing="1.4" fill="{T["subtle"]}">FUNCIONALIDADE {i:02d}</text>'
        f'<text x="32" y="82" font-family="{SANS}" font-size="28" font-weight="700" letter-spacing="-0.5" fill="{T["fg"]}">{escape(title)}</text>'
        f'{body}</svg>'
    )
    write(f"f-{i:02d}.svg", svg)


# ---------------------------------------------------------------- stack
def stack_card():
    pad, x, y, rows = 26, 26, 26, 1
    out = ""
    for i, s in enumerate(C["stack"]):
        w = chip_w(s)
        if x + w > 1000 - pad and x > pad:
            x, y, rows = pad, y + 40, rows + 1
        out += chip(round(x, 1), y, s, i)
        x += w + 10
    h = 2 * pad + 32 + (rows - 1) * 40
    svg = head(1000, h, "Stack: " + ", ".join(C["stack"]), "")
    svg += (
        f'<rect width="1000" height="{h}" rx="20" fill="{T["card"]}"/>'
        f'<rect x="0.5" y="0.5" width="999" height="{h - 1}" rx="19.5" fill="none" stroke="{T["borderStrong"]}"/>{out}</svg>'
    )
    write("stack.svg", svg)


# ------------------------------------------------------------- screenshots
def shot(slug, caption):
    W, bar, pad = 340, 28, 10
    uri, (iw, ih) = jpeg_uri(Image.open(SHOTS / f"{slug}.png"), 420)
    w = W - 2 * pad
    h = round(ih * w / iw)
    H = bar + pad + h + 12
    svg = head(
        W, H, f"Tela: {caption}",
        f'<defs>{radial("ga", T["accent"], 0.16)}<clipPath id="c"><rect x="{pad}" y="{bar + pad - 2}" width="{w}" height="{h + 2}" rx="12"/></clipPath></defs>',
    )
    svg += (
        f'<rect width="{W}" height="{H}" rx="16" fill="{T["card"]}"/>'
        f'<ellipse cx="{W / 2}" cy="{H}" rx="{W / 2}" ry="90" fill="url(#ga)"/>'
        f'<rect x="0.5" y="0.5" width="{W - 1}" height="{H - 1}" rx="15.5" fill="none" stroke="{T["borderStrong"]}"/>'
        f'<line x1="0" y1="{bar}" x2="{W}" y2="{bar}" stroke="{T["borderStrong"]}"/>{dots(18, 14)}'
        f'<text x="{W - 16}" y="18" text-anchor="end" font-family="{MONO}" font-size="12" fill="{T["subtle"]}">{escape(slug)}</text>'
        f'<image x="{pad}" y="{bar + pad - 2}" width="{w}" height="{h + 2}" preserveAspectRatio="xMidYMin slice" href="{uri}" clip-path="url(#c)"/></svg>'
    )
    write(f"shot-{slug}.svg", svg)


# --------------------------------------------------------------- rodapé
def footer():
    line2 = (
        f'<text x="500" y="74" text-anchor="middle" font-family="{SANS}" font-size="14" fill="{T["muted"]}">{escape(C["footer_line"])}</text>'
        if C.get("footer_line")
        else ""
    )
    svg = head(
        1000, 90, f"© {C['year']} {C['author']}",
        f'<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="{T["accent"]}" stop-opacity="0"/>'
        f'<stop offset="0.5" stop-color="{T["accent"]}"/><stop offset="1" stop-color="{T["accent2"]}" stop-opacity="0"/></linearGradient></defs>',
    )
    svg += (
        f'<rect x="0" y="13" width="1000" height="2" fill="url(#g)" opacity="0.7"/>'
        f'<text x="500" y="52" text-anchor="middle" font-family="{MONO}" font-size="12.5" fill="{T["subtle"]}">© {C["year"]} {escape(C["author"].upper())}</text>{line2}</svg>'
    )
    write("footer.svg", svg)


if __name__ == "__main__":
    banner()
    for b in C["buttons"]:
        button(b["file"], b["label"], b.get("primary", False))
    for b in C["author_buttons"]:
        button(b["file"], b["label"], False)
    for i, s in enumerate(C["sections"], 1):
        section_header(i, s)
    for i, (t, d) in enumerate(C["features"], 1):
        feature_card(i, t, d)
    stack_card()
    for slug, cap in C["shots"]:
        shot(slug, cap)
    footer()
    print("ok")
