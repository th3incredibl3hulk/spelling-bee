# BlockWorks Assets

Vendored official Roblox logo files were extracted from the public Roblox press
kit logo ZIP:

- Source page: `https://about.roblox.com/press-kit`
- ZIP used: `https://cms-media.roblox.com/assets/6dd8yllwqeistpspax7k.zip`
- Files used:
  - `Roblox_Tilt_Black.svg`
  - `Roblox_Tilt_White.svg`
  - `Roblox_Wordmark_Black.svg`
  - `Roblox_Wordmark_White.svg`

The other SVG files in this folder are original local theme art created for this
private spelling app:

- `blockworks-selfie.svg`
- `builder-legend.svg`
- `doors-lite.svg`
- `mystery-crate.svg`
- `obby-checkpoint.svg`
- `server-victory.svg`

## Curated Static Media

The files in `curated/` are downloaded once for local review and are served by
this app as static files. The app does not hotlink these sources at runtime.

User-provided reference:

- `curated/community-roblox-reference.jpg`
  - Source: `https://i.pinimg.com/736x/73/b3/cf/73b3cf8b63cd12b0646c19a4e7b11f5c.jpg`
  - Runtime use: active BlockWorks stage/fly-in/popup/collectible media.

Roblox game search metadata used to identify the requested experiences:

- DOORS by LSPLASH
  - Universe ID: `2440500124`
  - Place URL: `https://www.roblox.com/games/6516141723/DOORS`
- RIVALS by Nosniy Games
  - Universe ID: `6035872082`
  - Place URL: `https://www.roblox.com/games/17625359962/RIVALS`
- 99 Nights in the Forest by Grandma's Favourite Games
  - Universe ID: `7326934954`
  - Place URL: `https://www.roblox.com/games/79546208627805/99-Nights-in-the-Forest`

Roblox thumbnail endpoint used:

- Icons:
  - `https://thumbnails.roblox.com/v1/games/icons?universeIds=2440500124,6035872082,7326934954&size=512x512&format=Png&isCircular=false`
- Banners:
  - `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=2440500124,6035872082,7326934954&countPerUniverse=3&defaults=true&size=768x432&format=Png`

Downloaded Roblox CDN files:

- `curated/doors-icon.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-53f81a48fb348823169b97fd42a1094a/512/512/Image/Png/noFilter`
  - Runtime use: review-only; too intense for default reward moments.
- `curated/doors-banner-1.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-09f0d9b97f35839568ec129016b18485/768/432/Image/Png/noFilter`
  - Runtime use: review-only; too intense for default reward moments.
- `curated/doors-banner-2.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-3ea9f396137e6feadc69f9f1b8802812/768/432/Image/Png/noFilter`
  - Runtime use: active BlockWorks fly-in/popup/collectible media.
- `curated/rivals-icon.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-d9d421c558e5084dd1d7ada2ad21c995/512/512/Image/Png/noFilter`
  - Runtime use: review-only.
- `curated/rivals-banner-1.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-fc2dc9665f45f46557a21f154ed904a9/768/432/Image/Png/noFilter`
  - Runtime use: review-only; action-heavy.
- `curated/rivals-banner-2.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-4ca6e066ef51f10829f653ca849f350d/768/432/Image/Png/noFilter`
  - Runtime use: BlockWorks collectible only.
- `curated/99-nights-icon.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-bcbd6209f995ab05d6ecfc9d0690196d/512/512/Image/Png/noFilter`
  - Runtime use: review-only.
- `curated/99-nights-banner-1.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-9678332cb202a1636cf2caf2e85b5dbb/768/432/Image/Png/noFilter`
  - Runtime use: active BlockWorks stage/fly-in/popup/milestone/collectible media.
- `curated/99-nights-banner-2.png`
  - CDN: `https://tr.rbxcdn.com/180DAY-c5215eabc21f46723f0084f99bb7622c/768/432/Image/Png/noFilter`
  - Runtime use: review-only; more trap/combat focused.
