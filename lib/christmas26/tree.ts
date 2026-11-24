/**
 * THE CURVE TREE on /christmas26 (D128): a Christmas tree drawn as a performance curve.
 *
 * The idea, in the language of polynize.io's own hero chart: a cohort of curves starts low (amber),
 * rises through a dashed STANDARD line, turns mint above it, and every curve meets at the top,
 * where the star sits. The left half is the curve; the right half is its mirror image. Amber below
 * the standard and mint above it are the same colours and the same switch point as the cohort
 * curve on polynize.io, so the page reads as part of that site.
 *
 * ONE SOURCE, TWO USES. This builds the whole SVG as a string:
 *  - the page injects it with animation classes (draw the curve, mirror it, fill it, light the
 *    points, then the star), and
 *  - the WhatsApp preview image (`/christmas26/og.png`) renders it with no classes at all.
 * So the finished look must never depend on CSS: every final colour, dash and the mirror itself
 * are SVG attributes. The CSS only animates TOWARDS that state, with `animation-fill-mode:
 * backwards`, and does nothing when the visitor asks for reduced motion. That is also why the
 * mirror is two groups: the outer group's transform ATTRIBUTE does the mirroring, and the inner
 * group is the only one CSS transforms. A CSS transform-origin on the outer group would move the
 * attribute's transform too, and the right half would land 320 units off the page.
 *
 * No user input ever reaches this string, so injecting it is safe.
 */

export const TREE_W = 320;
export const TREE_H = 336;

const CX = TREE_W / 2;
const BASE_Y = 290;
const APEX_Y = 44;
const HEIGHT = BASE_Y - APEX_Y;
const HALF_W = 128;
/**
 * The standard sits a third of the way up: the cohort starts below it, reaches it, and most of
 * the tree is what comes after, past it.
 */
const STD_FRAC = 0.34;
const STD_Y = BASE_Y - HEIGHT * STD_FRAC;

/** polynize.io's cohort curve colours, as r,g,b. */
const MINT = '105,252,203';
const AMBER = '224,137,26';
const GOLD = '216,178,10';
const STAR = '255,214,76';

/** The cohort: each curve's base width as a share of the outline's. The first is the outline. */
const COHORT = [1, 0.74, 0.5, 0.27];

/**
 * The curve's rise, 0..1 over 0..1. Slow at first, then steeper, like a learning curve on a
 * bad-to-good scale: it gives the tree its flared base and its point. Three soft plateaus ride on
 * it (practice, then a jump) so each half reads as tiers of branches, not as a plain cone.
 */
function rise(t: number): number {
  const base = Math.pow(t, 1.3);
  // Zero at both ends, so the base meets the ground cleanly and the tip stays sharp.
  const tiers = 0.022 * Math.sin(t * Math.PI * 6) * Math.sin(t * Math.PI);
  return Math.min(1, Math.max(0, base + tiers));
}

function point(scale: number, t: number): [number, number] {
  return [CX - HALF_W * scale * (1 - t), BASE_Y - HEIGHT * rise(t)];
}

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** The left half of one cohort curve, from its base point up to the apex. */
function curvePath(scale: number): string {
  const steps = 72;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const [x, y] = point(scale, i / steps);
    d += `${i === 0 ? 'M' : 'L'}${n1(x)} ${n1(y)}`;
  }
  return d;
}

/** The outline, left half up and mirrored half down, closed along the base: the filled tree. */
function silhouettePath(): string {
  const steps = 72;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const [x, y] = point(1, i / steps);
    left.push(`${n1(x)} ${n1(y)}`);
    right.unshift(`${n1(TREE_W - x)} ${n1(y)}`);
  }
  return `M${left.join('L')}L${right.slice(1).join('L')}Z`;
}

/** A five-point star centred on (x, y). */
function starPath(x: number, y: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${n1(x + r * Math.cos(a))} ${n1(y + r * Math.sin(a))}`);
  }
  return `M${pts.join('L')}Z`;
}

/**
 * The lights: data points on the cohort curves, as [cohort index, t, side]. Left and right are not
 * mirror copies on purpose; real lights on a real tree are never symmetrical.
 */
const LIGHTS: Array<[number, number, 'l' | 'r']> = [
  [0, 0.16, 'l'], [0, 0.46, 'r'], [0, 0.7, 'l'], [0, 0.86, 'r'],
  [1, 0.3, 'r'], [1, 0.58, 'l'], [1, 0.8, 'r'],
  [2, 0.22, 'l'], [2, 0.5, 'r'], [2, 0.76, 'l'],
  [3, 0.36, 'r'], [3, 0.66, 'l'],
  [0, 0.3, 'l'], [1, 0.12, 'l'], [2, 0.12, 'r'], [0, 0.6, 'r'],
];

export type TreeClasses = {
  std: string;
  label: string;
  draw: string;
  mirror: string;
  fill: string;
  light: string;
  star: string;
};

/**
 * The SVG. Pass `classes` for the animated page version; leave it out for the still image.
 * `idPrefix` keeps the gradient ids unique if the tree is ever on a page twice.
 */
export function treeSvg(opts: { classes?: TreeClasses; idPrefix?: string } = {}): string {
  const c = opts.classes;
  const id = opts.idPrefix ?? 'xt';
  const cls = (name: keyof TreeClasses) => (c ? ` class="${c[name]}"` : '');
  const delay = (s: number) => (c ? ` style="animation-delay:${s}s"` : '');
  const bStop = 1 - STD_FRAC; // gradient runs top (0) to base (1)

  const curves = COHORT.map((scale, i) => ({
    d: curvePath(scale),
    width: i === 0 ? 2.4 : 1.1,
    opacity: i === 0 ? 1 : 0.6 - i * 0.08,
  }));

  // Thin cohort curves first, the outline on top.
  const drawn = [...curves].reverse();
  const leftCurves = drawn
    .map(
      (k, i) =>
        `<path d="${k.d}" pathLength="1" fill="none" stroke="url(#${id}-stroke)" stroke-width="${k.width}" stroke-opacity="${n1(k.opacity)}" stroke-linecap="round" stroke-linejoin="round"${cls('draw')}${delay(0.3 + (drawn.length - 1 - i) * 0.12)}/>`,
    )
    .join('');
  const mirroredCurves = drawn
    .map(
      (k) =>
        `<path d="${k.d}" fill="none" stroke="url(#${id}-stroke)" stroke-width="${k.width}" stroke-opacity="${n1(k.opacity)}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');

  const lights = LIGHTS.map(([k, t, side], i) => {
    const [lx, ly] = point(COHORT[k], t);
    const x = side === 'l' ? lx : TREE_W - lx;
    const rgb = ly > STD_Y ? AMBER : MINT;
    return `<g${cls('light')}${delay(2.75 + i * 0.045)}><circle cx="${n1(x)}" cy="${n1(ly)}" r="6.5" fill="rgb(${rgb})" fill-opacity="0.16"/><circle cx="${n1(x)}" cy="${n1(ly)}" r="2.6" fill="rgb(${rgb})"/></g>`;
  }).join('');

  const starY = APEX_Y - 4;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TREE_W} ${TREE_H}" width="${TREE_W}" height="${TREE_H}" role="img" aria-label="A Christmas tree drawn as a performance curve. A cohort of lines rises past a dashed standard line and meets at a star at the top.">`,
    '<defs>',
    `<linearGradient id="${id}-stroke" gradientUnits="userSpaceOnUse" x1="0" y1="${APEX_Y}" x2="0" y2="${BASE_Y}">`,
    `<stop offset="0" stop-color="rgb(${MINT})"/>`,
    `<stop offset="${n1((bStop - 0.03) * 100)}%" stop-color="rgb(${MINT})"/>`,
    `<stop offset="${n1((bStop + 0.04) * 100)}%" stop-color="rgb(${AMBER})"/>`,
    `<stop offset="1" stop-color="rgb(${AMBER})"/>`,
    '</linearGradient>',
    `<linearGradient id="${id}-fill" gradientUnits="userSpaceOnUse" x1="0" y1="${APEX_Y}" x2="0" y2="${BASE_Y}">`,
    `<stop offset="0" stop-color="rgb(${MINT})" stop-opacity="0.26"/>`,
    `<stop offset="${n1((bStop - 0.03) * 100)}%" stop-color="rgb(${MINT})" stop-opacity="0.12"/>`,
    `<stop offset="${n1((bStop + 0.04) * 100)}%" stop-color="rgb(${AMBER})" stop-opacity="0.10"/>`,
    `<stop offset="1" stop-color="rgb(${AMBER})" stop-opacity="0.04"/>`,
    '</linearGradient>',
    `<radialGradient id="${id}-glow">`,
    `<stop offset="0" stop-color="rgb(${STAR})" stop-opacity="0.55"/>`,
    `<stop offset="1" stop-color="rgb(${STAR})" stop-opacity="0"/>`,
    '</radialGradient>',
    '</defs>',
    // The ground and the trunk.
    `<line x1="14" y1="${BASE_Y}" x2="${TREE_W - 14}" y2="${BASE_Y}" stroke="rgb(255,255,255)" stroke-opacity="0.14" stroke-width="1"/>`,
    `<rect x="${CX - 7}" y="${BASE_Y + 1}" width="14" height="16" rx="2" fill="rgb(${AMBER})" fill-opacity="0.45"/>`,
    // The filled tree.
    `<path d="${silhouettePath()}" fill="url(#${id}-fill)"${cls('fill')}/>`,
    // The standard: dashed, gold, labelled, exactly as polynize.io draws its benchmark.
    `<line x1="0" y1="${n1(STD_Y)}" x2="${TREE_W}" y2="${n1(STD_Y)}" stroke="rgb(${GOLD})" stroke-opacity="0.6" stroke-width="1" stroke-dasharray="6 7"${cls('std')}/>`,
    `<text x="2" y="${n1(STD_Y - 8)}" fill="rgb(${GOLD})" fill-opacity="0.85" font-family="Inter, system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="1.2"${cls('label')}>STANDARD</text>`,
    // The left half draws; the right half is its mirror.
    `<g>${leftCurves}</g>`,
    `<g transform="translate(${TREE_W} 0) scale(-1 1)"><g${cls('mirror')}>${mirroredCurves}</g></g>`,
    lights,
    // The star, where every curve meets.
    `<g${cls('star')}>`,
    `<circle cx="${CX}" cy="${starY}" r="30" fill="url(#${id}-glow)"/>`,
    `<path d="${starPath(CX, starY, 13, 5.4)}" fill="rgb(${STAR})"/>`,
    '</g>',
    '</svg>',
  ].join('');
}
