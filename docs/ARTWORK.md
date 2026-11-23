# Artwork specification: replacing the placeholder

The hero currently uses **original placeholder SVG art**
(`src/components/KingdomScene.astro`). It will be replaced with **approved,
already-published ZAUNITED artwork** only. Never add private or unreleased
StoryForge assets to this repository.

Please supply high-quality masters. The build will create optimised AVIF/WebP
versions automatically (Astro's built-in image pipeline), so the files visitors
download stay small (target: under ~200 KB for the phone hero).

## Required: hero artwork (choose ONE option)

### Option A (recommended): full scene, two crops

| File | Size (px) | Ratio | Used on |
| --- | --- | --- | --- |
| `mesmer-hero-mobile.png` | 1600 × 1200 | 4:3 | iPhone and iPad portrait (below the title and buttons) |
| `mesmer-hero-wide.png` | 2400 × 1400 | 12:7 | iPad landscape and desktop (full-screen behind the text) |

Composition:
- **Mobile crop:** King Mesmer centred, full body, standing in the lower part
  of the frame. Keep him and any speech bubble inside the **middle 60% of the
  width**, because the sides are cropped on narrow phones. The top quarter fades into the
  page background, so keep it to sky or atmosphere.
- **Wide crop:** Mesmer in the **right half** (roughly 55–75% across). The
  **left 45% must be quiet and dark** (sky, mist, the Hollowing) because the
  title, motto and buttons sit there. Keep important detail out of the top and bottom
  10%, which can be cropped on very wide screens.
- Low-poly dark fantasy palette (midnight, deep purple, crimson, royal gold).
- No text baked into the image. The site adds the title and motto as real text.

### Option B (simplest): character cut-out over the current landscape

| File | Size (px) | Notes |
| --- | --- | --- |
| `mesmer-cutout.png` | at least 1000 × 1500 (portrait) | **Transparent background**, full body, feet on the bottom edge, about 5% padding. Leave out the speech bubble; the site draws it. |

## Recommended for launch

| File | Size (px) | Format | Purpose |
| --- | --- | --- | --- |
| `og-image.png` (or `.jpg`) | 1200 × 630 | PNG/JPEG, under 1 MB | Preview image when the link is shared on social platforms and messaging apps. Keep key content inside the central 1000 × 500. |
| `apple-touch-icon.png` | 180 × 180 | PNG, **no transparency** | iPhone/iPad home-screen icon |
| `crest.svg` (or `crest-512.png`) | 512 × 512 if PNG | SVG preferred; PNG with transparency | Favicon and the small crest in the top bar |
| `wordmark.svg` *(optional)* | vector | SVG | An official ZAUNITED logo, if one exists |

## Format rules (all files)

- **sRGB** colour, PNG (preferred) or maximum-quality JPEG masters, each under 10 MB.
- Final, approved, **already-public** artwork only.
- For each image, please also send:
  1. Confirmation that it is approved for public web use.
  2. A one-sentence description for screen readers (alt text), e.g.
     "King Mesmer, wearing a gold crown and crimson cloak, stands before the ruins of Zaun."

## Where the files will go (on approval)

- Hero art: `src/assets/art/` (optimised at build time)
- Share image and icons: `public/`
- The placeholder SVG stays in the repository history and is removed from the
  page when the official art is in place.
