import s from './drafting-grid.module.css';

/**
 * The "blueprint drafting grid" background — a faint mint orthogonal grid
 * at 80px pitch, fixed to the viewport, sitting behind page content. Used
 * across every capability-map surface (homepage, /agents Phase A + Phase B,
 * /blueprints/[id]) and the PAM Console so the depth language is consistent
 * across the whole product.
 *
 * Render as a sibling of (or first child of) the page's main wrapper.
 * `pointer-events: none` so it never intercepts clicks. `aria-hidden` so
 * assistive tech skips it. Pages that wrap content in a stacking-context
 * container (e.g. the homepage's `.dirC` with `isolation: isolate`) should
 * ensure the main wrapper has explicit `z-index: 1` so it stays above the
 * fixed grid.
 */
export function DraftingGrid() {
  return <div className={s.grid} aria-hidden />;
}
