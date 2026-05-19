# Native asset source files

These are the source images that `@capacitor/assets` (run via `npm run ios:assets`)
fans out into every iOS icon and splash size the App Store / iPhones need.

| File | Required size | Used for |
| --- | --- | --- |
| `icon.png` | 1024 × 1024 | App icon (all iOS variants) |
| `icon-foreground.png` | 1024 × 1024 (transparent bg) | Adaptive icon foreground |
| `icon-background.png` | 1024 × 1024 (solid color or pattern) | Adaptive icon background |
| `splash.png` | 2732 × 2732 (centered logo on background) | Splash screen (all device sizes) |
| `splash-dark.png` | 2732 × 2732 | Dark-mode splash |

Re-generate native assets after editing any of these:
```bash
npm run ios:sync && npm run ios:assets
```

If a source file is missing, `@capacitor/assets` will skip that variant
gracefully — but the App Store requires `icon.png` to ship.

---

## Quick-and-dirty icon generation (no design tool needed)

The Edge route `/icon` at `https://bagslot.vercel.app/icon` renders the brand
mark as PNG. Fetch it once and save to disk:

```bash
# 1024x1024 master icon
curl -L "https://bagslot.vercel.app/icon" -o icon.png

# 180x180 apple-touch already exists at /apple-icon, but we need 1024 for the store
```

The Vercel route uses Edge runtime ImageResponse at 512×512 — for 1024 you can
edit `src/app/icon.tsx`, bump `size`, redeploy, fetch.

For the splash, the simplest 2732×2732 is the same mark centered on cream:

```bash
# Generate splash.png in any image tool — 2732x2732, #FBFAF9 background,
# the B mark centered at ~512px square. Repeat with #0A0A0F background
# for splash-dark.png.
```
