import s from './christmas26.module.css';
import { treeSvg } from '@/lib/christmas26/tree';

/**
 * The curve tree, animated once on load (D128). The SVG itself is built in lib/christmas26/tree.ts,
 * which the preview image uses too; this only adds the animation classes. No user input reaches
 * the markup, so injecting it is safe.
 */
export function CurveTree() {
  const markup = treeSvg({
    classes: {
      std: s.treeStd,
      draw: s.treeDraw,
      mirror: s.treeMirror,
      fill: s.treeFill,
      light: s.treeLight,
      star: s.treeStar,
    },
  });
  return <div className={s.tree} dangerouslySetInnerHTML={{ __html: markup }} />;
}
