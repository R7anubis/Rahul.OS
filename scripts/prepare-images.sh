#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# RAHUL.OS — portrait + social asset pipeline
#
# Derives every image the site ships from the single supplied source portrait.
# Requires ImageMagick (`convert`) — pre-installed on most Linux images.
#
#   bash scripts/prepare-images.sh
#
# Outputs (all committed, no remote image URLs are ever used):
#   public/images/portrait-640.jpg          portrait, natural colour (native aspect)
#   public/images/portrait-960.jpg          editorial framing applied per breakpoint in CSS
#   public/images/portrait-1280.jpg
#   public/images/portrait-duotone-640.jpg  monochrome/duotone treatment
#   public/images/portrait-duotone-960.jpg  (used in the dark hero)
#   public/images/portrait-duotone-1280.jpg
#   public/images/og-cover.jpg              1200x630 Open Graph card
#   public/avatar.png                       512px square avatar for schema.org
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${1:-$ROOT/assets-src/portrait-source.jpeg}"
OUT="$ROOT/public/images"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ ! -f "$SRC" ]; then
  echo "error: source portrait not found at $SRC" >&2
  exit 1
fi

command -v convert >/dev/null 2>&1 || { echo "error: ImageMagick 'convert' is required" >&2; exit 1; }

mkdir -p "$OUT"

echo "→ source: $SRC ($(identify -format '%wx%h' "$SRC"))"

# 1. Normalised base. The supplied portrait is within a whisker of 4:5 already,
#    so the base keeps its native aspect and the *editorial* framing (head in the
#    upper third, shoulders bleeding off the bottom) is applied in CSS with
#    `object-position`, per breakpoint. Cropping in CSS keeps full resolution for
#    every layout instead of baking one crop into the JPEG.
BASE="$TMP/base.jpg"
convert "$SRC" -auto-orient -strip -quality 94 "$BASE"

# 2. Natural-colour responsive set.
for w in 640 960 1280; do
  convert "$BASE" -resize "${w}x" -strip -interlace Plane -quality 86 \
    "$OUT/portrait-$w.jpg"
  echo "  ✓ portrait-$w.jpg ($(identify -format '%wx%h' "$OUT/portrait-$w.jpg"))"
done

# 3. Duotone treatment for the dark hero: high-contrast monochrome mapped from
#    near-black to bone white, with a whisper of the red accent in the midtones.
#    Keeps the portrait legible and readable next to light-on-dark type.
DUO="$TMP/duo.jpg"
convert "$BASE" \
  -colorspace Gray \
  -level 4%,97% \
  -sigmoidal-contrast 3.2,46% \
  +level-colors '#0c0c0d','#f4f2ee' \
  -fill '#ff4530' -colorize 5% \
  -strip -quality 88 "$DUO"

for w in 640 960 1280; do
  convert "$DUO" -resize "${w}x" -strip -interlace Plane -quality 86 \
    "$OUT/portrait-duotone-$w.jpg"
  echo "  ✓ portrait-duotone-$w.jpg ($(identify -format '%wx%h' "$OUT/portrait-duotone-$w.jpg"))"
done

# 4. Square avatar (schema.org person image + command palette header).
convert "$BASE" -resize 1024x -gravity north -crop 1:1+0+40 +repage \
  -resize 512x512 -strip -quality 90 "$OUT/../avatar.png"

# 5. Open Graph card — 1200x630, dot matrix field, duotone crop of the portrait on
#    the right, wordmark on the left. Built with the fonts we already self-host.
OG="$TMP/og.png"
convert -size 1200x630 xc:'#0a0a0b' "$OG"

# dot grid via a tiled 8px cell (single pixel dot per cell)
convert -size 8x8 xc:none -fill 'rgba(255,255,255,0.09)' -stroke none \
  -draw 'point 3,3' "$TMP/dot.png"
convert "$OG" \( -size 1200x630 "tile:$TMP/dot.png" \) -compose over -composite "$OG"

# portrait block, duotone, hard-edged frame
convert "$DUO" -resize 560x700^ -gravity north -crop 470x588+0+0 +repage \
  "$TMP/og-portrait.jpg"
convert "$OG" -fill '#151516' -stroke '#2a2a2c' -strokewidth 1 \
  -draw "rectangle 690,21 1160,609" "$OG"
convert "$OG" "$TMP/og-portrait.jpg" -geometry +690+21 -composite "$OG"
# red corner accent on the portrait frame
convert "$OG" -fill '#ff4530' -stroke none -draw "rectangle 690,21 700,140" "$OG"

convert "$OG" \
  -font 'DejaVu-Sans-Mono' -pointsize 20 -fill '#8b8b8f' -stroke none \
  -annotate +72+120 'RAHUL.OS — PERSONAL SYSTEM' \
  -font 'DejaVu-Sans-Bold' -pointsize 82 -fill '#f4f2ee' \
  -annotate +66+250 'RAHUL RAJ' \
  -font 'DejaVu-Sans' -pointsize 34 -fill '#c9c9cc' \
  -annotate +66+330 'Data science, AI &' \
  -annotate +66+376 'game technology.' \
  -font 'DejaVu-Sans-Mono' -pointsize 20 -fill '#8b8b8f' \
  -annotate +72+560 'MELBOURNE, AU' \
  -fill '#ff4530' -draw "rectangle 66,190 140,193" \
  "$OUT/og-cover.jpg"

echo "  ✓ og-cover.jpg (1200x630)"
echo "  ✓ avatar.png (512x512)"
echo "→ done. All assets written to public/."
