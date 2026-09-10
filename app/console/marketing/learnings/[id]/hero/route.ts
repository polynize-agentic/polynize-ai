/**
 * POST /console/marketing/learnings/[id]/hero (D115): four images for the public page, from a line
 * about the look. The same rules as a Story's hero (D51): fill the frame, a real scene, no text. Made
 * for the Polynize board, whose library the chosen one is registered in.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/console-auth';
import { getLearning } from '@/lib/marketing/learning-store';
import { isHiggsfieldConfigured } from '@/lib/marketing/higgsfield';
import { imageModelById, providerOf, DEFAULT_POST_IMAGE_MODEL } from '@/lib/marketing/higgsfield-models';
import { openRouterKey } from '@/lib/marketing/openrouter-image';
import { generateHostedImages } from '@/lib/marketing/image-generate';
import { HERO_BATCH, HERO_W, HERO_H } from '@/lib/marketing/hero';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const Body = z.object({ prompt: z.string().trim().min(3).max(1200), model: z.string().trim().max(60).optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.scope.type !== 'team') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'write a line about the look first' }, { status: 400 });
  }
  const l = await getLearning(id);
  if (!l) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const model = imageModelById(body.model ?? '') ?? imageModelById(DEFAULT_POST_IMAGE_MODEL);
  if (!model) return NextResponse.json({ error: 'no image model is configured' }, { status: 400 });
  if (providerOf(model) === 'higgsfield' && !isHiggsfieldConfigured()) {
    return NextResponse.json({ error: 'Image generation is not connected yet. Add the Higgsfield keys in Vercel.' }, { status: 400 });
  }
  if (providerOf(model) === 'openrouter' && !openRouterKey()) {
    return NextResponse.json({ error: 'That model needs an OpenRouter key. Add it in Vercel.' }, { status: 400 });
  }

  const prompt =
    `${body.prompt.trim()} ` +
    'Fill the entire frame edge to edge with the scene itself. No border, no white margin, no mount, ' +
    'no paper edge, no frame around the picture, no vignette and no blank area anywhere: this IS the ' +
    'photograph, not a print or a scan of a photograph sitting on a page. A real photographic scene, ' +
    'not a screenshot, not a slide layout, not a poster. ' +
    'No text, no words, no letters, no numbers, no logos and no signage anywhere in the image.';
  const gen = await generateHostedImages(
    model,
    { prompt, count: HERO_BATCH, frame: { w: HERO_W, h: HERO_H } },
    { stream: 'polynize', requestOrigin: new URL(req.url).origin }
  );
  if (gen.urls.length === 0) {
    return NextResponse.json({ error: gen.error ?? 'Could not make the image. Try again.' }, { status: 502 });
  }
  return NextResponse.json({ urls: gen.urls });
}
