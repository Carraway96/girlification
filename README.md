# Girlification - Comedic Apartment Defense Prototype

A small, playable top-down strategy/survival prototype where you defend your bachelor apartment from soft domestic takeover.

## Recommended framework

This build uses **HTML5 Canvas + vanilla JavaScript** for the fastest zero-dependency prototype loop.

Why this stack:
- no install required
- instant iteration
- easy to expand into a full game

## Included systems

- WASD top-down movement
- `E` interaction near items
- action menu with:
  - Hide (`1`)
  - Relocate (`2`)
  - Remove (`3`)
- timed item placement with pressure scaling (starts around 20-40 seconds)
- combo raid events with 2-3 rapid item drops
- Swedish placement dialogue lines (exact requested lines)
- Girlification Level meter (0-100)
- Annoyance Meter (0-100) with decay + escalation rules
- room control states:
  - Neutral
  - Contested
  - Girlified
- synergy bonuses:
  - Cozy Combo
  - Established Presence
  - Domestic Drift
- collision system:
  - interior wall colliders
  - furniture colliders
- girlfriend directional sprites (`back/front/left/right`)
- anime-style bottom-right avatar panel during girlfriend dialogue
- simple generated sound effects for actions and events (WebAudio)
- power-ups with cooldowns (Closet Blitz + Calm Talk)
- occasional mood swing day (red tint + temporary difficulty spike)
- game over conditions:
  - full Girlification
  - full Annoyance
- win condition:
  - survive the target number of days
- end screen stats:
  - removed/hidden/relocated
  - rooms lost
  - suspicion triggers

## Folder structure

```text
Girlification/
├─ index.html
├─ style.css
├─ game.js
├─ README.md
└─ images/
   ├─ girl_back.png
   ├─ girl_front.png
   ├─ girl_left.png
   ├─ girl_right.png
   └─ girl_avatar.png
```

## Run instructions

Option 1 (quickest):
1. Open `index.html` in a browser.

Option 2 (recommended local server):
1. In this folder, run a local static server (for example, `python -m http.server 8080`).
2. Open `http://localhost:8080`.

## Controls

- Move: `WASD`
- Interact: `E`
- Power-ups:
  - `Q` Closet Blitz (hide nearby clutter burst)
  - `F` Calm Talk (temporary tension control)
- In action menu:
  - `1` Hide
  - `2` Relocate
  - `3` Remove
  - `Esc` or `E` Cancel
- Restart run after end: `R`

## Gameplay notes

- Removing items aggressively increases Annoyance quickly.
- Hiding and relocating are safer but reduce Girlification less.
- Girlification rises through:
  - item value
  - item age (settling in over time)
  - room permanency bonuses
  - room synergies
- As rooms flip to `Girlified`, they gain permanent pressure effects.
- Spawn pressure and day duration are tuned faster for snappier runs.

## Placeholder asset plan

Current visuals use simple geometric placeholders for most apartment objects.

Possible next art pass:
- sprite sheets for room furniture
- item sprites replacing colored blocks
- player sprite set (front/back/left/right)
- UI portraits and reaction emotes
- ambient VFX overlays (dust motes, warm lamp glow)

## Expansion ideas

- add day/night lighting cycle
- add boss item (full-length mirror / storage bench / reserved drawer)
- add pause/settings + sound design toggles
- add mini-map and per-room reclaim goals
