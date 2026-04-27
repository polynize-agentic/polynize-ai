import type { BlueprintPayload } from '@/lib/blueprint/load';
import s from './blueprint.module.css';
import { firstNameOf } from './util';

export function Team({ payload }: { payload: BlueprintPayload }) {
  const { answers, data } = payload;
  const firstName = firstNameOf(answers.name);
  const agents = data.team.agents;

  return (
    <section className={s.page} data-screen-label="Page 03 · Team">
      <div className={s.pageHead}>
        <div className={s.pageNum}>02 / 04</div>
        <div className={s.eyebrow}>§ your team</div>
        <h2 className={s.pageTitle}>
          One human.
          <br />
          <span className={s.mint}>{agents.length}</span> agents. One bottleneck
          <span className={s.mint}>.</span>
        </h2>
        <p className={s.pageLede}>
          This is the team we&apos;d build to cover the mint and amber capabilities on your map.
          Human-sounding names because you&apos;ll be working with them like colleagues. Each agent
          owns a specific slice of the bottleneck so the pipeline keeps moving without anyone chasing
          anyone.
        </p>
      </div>

      <div className={s.humanLead}>
        <div className={s.eyebrow}>§ the human at the centre</div>
        <div className={s.leadRow}>
          <div className={s.leadAv}>
            <div className={s.leadInitial}>{firstName[0]}</div>
            <div className={s.leadHalo} />
          </div>
          <div>
            <div className={s.leadName}>
              {firstName} <span style={{ color: 'var(--text-3)' }}>(you)</span>
            </div>
            <div className={s.leadRole}>{data.team.human_owner.role}</div>
            <p className={s.leadDesc}>
              The team is shaped around you. You hold the strategic decisions, the high-stakes
              calls, and any exceptions outside the standard pattern. The agents below take the
              structured execution off your team&apos;s plate and bring you the work that needs your
              judgment, pre-chewed.
            </p>
          </div>
        </div>
      </div>

      <div className={s.agentGrid}>
        {agents.map((a, i) => (
          <div key={`${a.name}-${i}`} className={s.agentCard}>
            <div className={s.agentHead}>
              <div className={s.agentNum}>A{String(i + 1).padStart(2, '0')}</div>
              <div className={s.agentAv}>{a.name[0]}</div>
            </div>
            <div className={s.agentName}>{a.name}</div>
            <div className={s.agentRole}>{a.role}</div>
            <p className={s.agentWhat}>{a.short_desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
