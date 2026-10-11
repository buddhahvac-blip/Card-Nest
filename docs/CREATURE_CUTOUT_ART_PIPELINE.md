# Phase 2B — Approved Transparent Creature Art Pipeline

The transparent creature renderer is installed, but deliberately has **zero approved cutouts**. Do not infer cutouts from full-card art: automatic segmentation changes the canon art and can leave unwanted artifacts.

## Asset conventions
1. Produce or commission a clean transparent-background PNG or WebP of the **same** approved creature and pose identity. Do not use RAID art.
2. Export at 768–1200px tall where source permits; preserve transparency, wings, tails, and other silhouette details. Do not enlarge a low-res source.
3. Put the file under `public/art/battle-creatures/<card-id>.webp` (or PNG).
4. In `lib/battle-creature-cutouts.ts`, add a reviewed mapping such as `'reserved-108':'/art/battle-creatures/reserved-108.webp'` only after the file exists and the visual matches the live card.
5. Keep original portrait underneath. A failed cutout image must be hidden and leave the portrait usable.
6. Verify both Nest Battles `/play` and Rune Dungeon `/rune-dungeon`, narrow mobile viewport, reduced motion, boss and regular cards.

## Quality gates before enabling a card
- Transparent alpha channel present; no visible checkerboard, jagged halo, watermark or blurred reconstruction.
- Correct creature, card ID, theme, proportions, details and silhouette from approved canonical art.
- Feet/body sit visually near the Phase 2A ground circle, avoiding clipped wings or UI overlap.
- No hitbox / combat timing / damage / rewards changes.
- Review screenshot with opt-in cinematic preview and confirm on low-power mobile.

## Limitations
The current Phase 2B implementation overlays a cutout on the existing circular portrait. It does **not yet** remove the portrait backdrop, reposition a full-body sprite on the floor, or supply actual transparent artwork. Those need a separate visual and art acceptance step.
