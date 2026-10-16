# Pincheck

Pincheck is a board-aware ESP32 GPIO reference. Choose a supported board and a task to see suitable pins, capability notes, and wiring guidance.

## What it does

- Supports ESP32 DevKit V1, ESP32-DevKitC V4, ESP32-S3-DevKitC-1, and ESP32-C3-DevKitM-1 profiles.
- Recommends pins for sensors, digital outputs, interrupts, analog inputs, pull-ups, and pull-downs.
- Explains pin restrictions such as input-only pins, boot-strapping pins, ADC and Wi-Fi considerations, and reserved signals.
- Shows an interactive board pin diagram, translates common silkscreen labels, and warns when the physical pin count conflicts with the selected profile.
- Provides a small Arduino setup example for the selected pin.

Pincheck is a reference tool, not a substitute for checking the exact board revision. Compatible and clone boards can differ. Confirm the module marking, pin labels, voltage requirements, and the connected component's datasheet before wiring; ESP32 GPIOs are 3.3 V logic.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To check types and create a production build:

```sh
npm run typecheck
npm run build
npm run preview
```

## Project structure

```text
index.html
src/
  App.tsx
  main.tsx
  index.css
  settings/types.ts
  components/generated/
    ESP32PinChecker.tsx
    ESP32PinChecker.css
docs/
  DEVELOPMENT_HISTORY.md
```

The pin-checker component and board data live in `src/components/generated/ESP32PinChecker.tsx`; its component styles are alongside it. The Vite entry point and app shell are intentionally small.

## Development record

See [docs/DEVELOPMENT_HISTORY.md](docs/DEVELOPMENT_HISTORY.md) for the recovered version history and its source notes.
