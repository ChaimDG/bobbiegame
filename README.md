# Snoetjes Game

Een kleurrijke mobiele browsergame, gemaakt met React en Vite. De game werkt op desktop en mobiele browsers en bestaat momenteel uit vier speelbare modes:

- **Snoetjes Wings**: surf over heuvels, verzamel botjes en bouw snelheid op.
- **Snoetjes Match**: een match-puzzel met cascades, power-ups en swipe-bediening.
- **Snoetjes Defense**: verdedig het park met hondenthema-torens.
- **Snoetjes Jump**: stuiter omhoog langs platforms en verzamel gouden botjes.

## Lokaal starten

Installeer de dependencies en start Vite:

```powershell
pnpm install
pnpm run dev
```

Open daarna `http://localhost:5174/`. Op Windows kan ook `Start-Snoetjes-Game.cmd` worden gebruikt.

## Publiceren

Elke push naar `main` bouwt en publiceert de game via GitHub Pages. De productiepagina wordt bereikbaar op:

`https://chaimdg.github.io/bobbiegame/`

## Projectstructuur

- `src/components`: menu's en gedeelde UI-componenten.
- `src/game`: Snoetjes Wings, physics en terrain rendering.
- `src/match`: Snoetjes Match, cascade-engine en power-ups.
- `src/defense`: Snoetjes Defense, waves, torens en rendering.
- `src/jump`: Snoetjes Jump, platformphysics en rendering.
- `src/assets`: originele bitmap-artwork voor de game.
