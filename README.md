# Bobbie Game

Een kleurrijke mobiele browsergame, gemaakt met React en Vite. De game werkt op desktop en mobiele browsers en bestaat momenteel uit drie speelbare modes:

- **Bobbie Wings**: surf over heuvels, verzamel botjes en bouw snelheid op.
- **Bobbie Match**: een match-puzzel met cascades, power-ups en swipe-bediening.
- **Bobbie Defense**: verdedig het park met hondenthema-torens.

## Lokaal starten

Installeer de dependencies en start Vite:

```powershell
pnpm install
pnpm run dev
```

Open daarna `http://localhost:5174/`. Op Windows kan ook `Start-Bobbie-Game.cmd` worden gebruikt.

## Publiceren

Elke push naar `main` bouwt en publiceert de game via GitHub Pages. De productiepagina wordt bereikbaar op:

`https://chaimdg.github.io/bobbiegame/`

## Projectstructuur

- `src/components`: menu's en gedeelde UI-componenten.
- `src/game`: Bobbie Wings, physics en terrain rendering.
- `src/match`: Bobbie Match, cascade-engine en power-ups.
- `src/defense`: Bobbie Defense, waves, torens en rendering.
- `src/assets`: originele bitmap-artwork voor de game.
