import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/console-auth';
import { listIdeas } from '@/lib/marketing/idea-store';
import { isStreamId, canSeeStream, visibleStreams } from '@/lib/marketing/streams';
import { NewNarrative, type IdeaRow } from './NewNarrative';
import { titleShape, titleChecks } from '@/lib/marketing/split-screen';

export const dynamic = 'force-dynamic';

/**
 * Gate 1's server side: the ideas inbox for the stream we came from (D45).
 *
 * `?stream=` scopes the inbox as well as fixing the lane, because an idea caught for one
 * person is not a candidate for another's narrative. With no stream it falls back to every
 * stream merged, newest first, which is what the screen did before it had an owner.
 *
 * Ideas already marked used are hidden rather than shown struck through, because this screen is
 * a chooser and a spent idea is not a choice. They stay in the inbox screens untouched.
 */
export default async function NewNarrativePage({
  searchParams,
}: {
  searchParams: Promise<{ stream?: string; idea?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.scope.type === 'client') {
    redirect(`/console/${user.scope.slug}/blueprint`);
  }

  const { stream, idea: preselect } = await searchParams;
  // A private board's Gate 1 is its owner's (D114).
  if (isStreamId(stream) && !canSeeStream(user.email, stream)) redirect('/console/marketing');
  const fixedLane = isStreamId(stream) ? stream : undefined;
  const streams = visibleStreams(user.email);
  const lanes = fixedLane ? [fixedLane] : streams.map((st) => st.id);
  const lists = await Promise.all(
    lanes.map((l) =>
      listIdeas(l).catch(() => [] as Awaited<ReturnType<typeof listIdeas>>)
    )
  );

  // Sort on the ISO timestamp, never on the display string: a localised date like
  // 18/08/2026 string-compares day-first and misorders the moment two months mix.
  const rows: (IdeaRow & { at: string })[] = [];
  /**
   * ARCHIVED HOOKS (D105): inbox ideas that are titles and have been used, which for a hook means a
   * post made from it was scheduled. Shown at the bottom of the Hook library, out of circulation.
   */
  const archived: (IdeaRow & { at: string })[] = [];
  lanes.forEach((lane, ix) => {
    for (const i of lists[ix]) {
      if (!i.text.trim()) continue;
      if (i.used_at) {
        if (titleShape(i.text) && titleChecks(i.text).length === 0) {
          archived.push({
            id: i.id,
            lane,
            text: i.text.trim(),
            at: i.used_at,
            when: new Date(i.used_at).toLocaleDateString('en-AU'),
          });
        }
        continue;
      }
      rows.push({
        id: i.id,
        lane,
        text: i.text.trim(),
        at: i.created_at ?? '',
        when: i.created_at ? new Date(i.created_at).toLocaleDateString('en-AU') : '',
        // In flight (D109): a piece exists for it and nothing from it has shipped yet.
        inFlight: Boolean(i.piece_ref),
        pieceRef: i.piece_ref,
      });
    }
  });
  rows.sort((a, b) => b.at.localeCompare(a.at));
  archived.sort((a, b) => b.at.localeCompare(a.at));
  const archivedTitles = archived.slice(0, 24).map(({ at: _at, ...r }) => r);
  /**
   * SAVED TITLES (D104). A title saved from the script screen lands in the inbox as an idea whose
   * text is a title. Gate 1 shows those as their own group when the way out is a split screen or a
   * yap, so a good title found while working on another one is one click away later. Recognised by
   * shape (opens with Why or How and passes the title tests), not by a flag: an idea he typed as a
   * title on his phone counts too.
   */
  const savedTitles = rows
    .filter((r) => titleShape(r.text) && titleChecks(r.text).length === 0)
    .slice(0, 16)
    .map(({ at: _at, ...r }) => r);
  // The chooser shows a screenful, not the whole archive: the inbox remains the archive.
  const recent = rows.slice(0, 8).map(({ at: _at, ...r }) => r);

  return (
    <NewNarrative
      ideas={recent}
      streams={streams.map((st) => ({ id: st.id, label: st.label }))}
      fixedLane={fixedLane}
      // "Create narrative" on an inbox idea lands here with that idea already chosen (D103).
      preselect={typeof preselect === 'string' && rows.some((r) => r.id === preselect) ? preselect : undefined}
      savedTitles={savedTitles}
      archivedTitles={archivedTitles}
    />
  );
}
