<h1 align="center">Resource Tile Planner</h1>

A resource‑aware tile sandbox for experimenting with grid layouts, observing a layout's outputs, and optimizing tile placement.

---

## Problem
Tile‑based building games often lock layout controls behind progression systems, limiting experimentation. This makes it hard for players or developers to freely test layouts and resource outputs.

## Solution
Resource Tile Planner removes those restrictions. It provides a **resource‑aware tile system** where you can plan layouts, observe resource generation, and experiment with AOE modifiers. Otherwise, you can skip the resources and work with a simple tile planner too. I aim to keep the app general so it can be expanded into other use cases.

---

## Features
- Snap‑to‑grid tile placement
- Resource system with:
  - Tiles that generate resources (labelled as tile outputs)
  - Color‑based highlighting for AOE and outputs
- Three preset tiles to start with
- Tile customization:
  - Adjust width/height (snapped to grid)
  - Lock aspect ratio for quick scaling
  - Change tile color
  - Delete selected tile
  - Add an area of effect for 1 resource with adjustable percentage modifiers
  - Add multiple outputs with generation amount + refresh interval
- Auto‑aggregated resource totals for a particular layout,  displayed in amount per unit time (seconds, minutes, hours, days)
- Auto‑aggregated bonus outputs from tiles' AOE

---

## User Guide
How can you benefit?
- Place tiles on the grid
- Customize their properties
- Observe total outputs/bonuses as you place tiles
- Experiment with AOE placements
- Optimize layouts for maximum efficiency

---

## Developer Notes
If you want to explore the code or run it locally:
1. Install dependencies 
    ```
    npm install
    ```
2. Run dev server 
    ```
    npm run dev
    ```

---
## Roadmap
- Multiselect for moving/deleting tiles
- LocalStorage session persistence
- Custom presets
- More features (your suggestions are welcome!)
---
## Acknowledgements
Further updates are still in progress.
Improvements and feature suggestions are welcome with prior discussion.

Your support keeps development going !

If this app helped you,please leave a comment and a star ⭐ ! 


