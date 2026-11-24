/**
 * /christmas26/og.png: the link preview image for the invite (D128), 1200 x 630.
 *
 * Most guests see the link in WhatsApp first, so this is the first thing they see. It is drawn
 * here rather than saved as a file so it can never drift from the page: the tree is the same SVG
 * the page animates (lib/christmas26/tree.ts), shown finished.
 *
 * Built once at deploy time (force-static) and served from the cache after that. The path has a
 * dot, so middleware never sees it and it works on polynize.ai.
 *
 * FONTS DEGRADE, THEY DO NOT FAIL. Inter comes from jsDelivr, as the slide renderer's fonts do. If
 * the fetch fails, the image is drawn in the renderer's built-in font: a preview in the wrong
 * font is still a preview, a failed deploy is not.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { treeSvg, TREE_W, TREE_H } from '@/lib/christmas26/tree';

export const dynamic = 'force-static';
export const runtime = 'nodejs';

const W = 1200;
const H = 630;

const INTER_400 = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';
const INTER_700 = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf';

type Font = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };

async function fonts(): Promise<Font[]> {
  try {
    const [regular, bold] = await Promise.all(
      [INTER_400, INTER_700].map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`font ${res.status}`);
        return res.arrayBuffer();
      }),
    );
    return [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ];
  } catch (e) {
    console.warn('[christmas26 og] Inter unavailable, using the built-in font:', e instanceof Error ? e.message : e);
    return [];
  }
}

async function logo(): Promise<string | null> {
  try {
    const png = await readFile(join(process.cwd(), 'public/assets/logo-text-white.png'));
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET() {
  const [fontList, logoSrc] = await Promise.all([fonts(), logo()]);
  const tree = `data:image/svg+xml;base64,${Buffer.from(treeSvg()).toString('base64')}`;
  const treeH = 560;
  const treeW = Math.round((treeH * TREE_W) / TREE_H);

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 64px 0 80px',
          background: '#000',
          color: '#fff',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: 600 }}>
          {logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- satori draws plain <img> only
            <img src={logoSrc} width={132} height={36} alt="" style={{ marginBottom: 56 }} />
          )}
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1.05 }}>
            Polynize
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: '#69fccb',
            }}
          >
            Christmas Party
          </div>
          <div style={{ display: 'flex', width: 40, height: 2, background: 'rgba(255,255,255,0.4)', margin: '36px 0 28px' }} />
          <div style={{ display: 'flex', fontSize: 30, color: 'rgba(255,255,255,0.78)', lineHeight: 1.4 }}>
            Thursday 17 December, 6pm to 9pm
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: 'rgba(255,255,255,0.78)', lineHeight: 1.4 }}>
            Commons Bar, Melbourne
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- satori draws plain <img> only */}
        <img src={tree} width={treeW} height={treeH} alt="" />
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: fontList.length > 0 ? fontList : undefined,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    },
  );
}
