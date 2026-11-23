/**
 * Generates the small brand files in public/ from the official artwork in
 * src/assets/brand/. Crop and resize only: colours, artwork and wording are
 * never changed. Re-run after replacing the source artwork:
 *
 *   node scripts/prepare-brand-icons.mjs
 */
import sharp from 'sharp';

const brand = new URL('../src/assets/brand/', import.meta.url);
const pub = new URL('../public/', import.meta.url);
const banner = new URL('zaunited-banner.png', brand).pathname;
const profile = new URL('zaunited-profile.png', brand).pathname;
const out = (name) => new URL(name, pub).pathname;

// Mesmer's face and crown, cropped from the profile picture (readable at tab-icon size).
const FACE = { left: 330, top: 60, width: 520, height: 520 };

await sharp(profile).extract(FACE).resize(32, 32).png().toFile(out('favicon-32.png'));
await sharp(profile).extract(FACE).resize(96, 96).webp({ quality: 85 }).toFile(out('crest-96.webp'));
// Home-screen icon: the whole badge, on an opaque background (iOS requirement).
await sharp(profile).resize(180, 180).flatten({ background: '#000000' }).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(out('apple-touch-icon.png'));
// Link preview (1200 × 630): centre of the banner, keeping Mesmer, the title and the motto.
const meta = await sharp(banner).metadata();
const cropWidth = Math.round(meta.height * (1200 / 630));
await sharp(banner)
  .extract({ left: Math.round((meta.width - cropWidth) / 2), top: 0, width: cropWidth, height: meta.height })
  .resize(1200, 630)
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out('og-image.jpg'));

console.log('Brand icons and share image written to public/.');
