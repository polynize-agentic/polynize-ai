import type { BlueprintPayload } from '@/lib/blueprint/load';
import { getAgentDetail } from '@/lib/blueprint/agent-detail';
import s from './blueprint.module.css';
import { firstNameOf } from './util';

export function Team({ payload }: { payload: BlueprintPayload }) {
  const { answers, data } = payload;
  const firstName = firstNameOf(answers.name);
  const agents = data.team.filter((m) => m.type === 'agent');

  return (
    <section className={s.page} data-screen-label="Page 03 · Team">
      <div className={s.pageHead}>
        <div className={s.pageNum}>02 / 04</div>
        <div className={s.eyebrow}>§ your agent team</div>
        <h2 className={s.pageTitle}>
          One human.
          <br />
          <span className={s.mint}>{agents.length}</span> agents. One outcome
          <span className={s.mint}>.</span>
        </h2>
        <p className={s.pageLede}>
          This is the team we&apos;d build to cover the mint and amber cells on your heat map.
          Human-sounding names because you&apos;ll be working with them like colleagues. Each one is
          shaped around a specific slice of your {data.shape_display_name.toLowerCase()} work.
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
            <div className={s.leadRole}>Human Lead · judgment, direction, close</div>
            <p className={s.leadDesc}>
              The unit is shaped around you. You hold the strategic decisions, the client-facing
              conversations, and the final call on anything that carries risk. The agents below take
              everything else off your plate and bring you the work that needs your judgment,
              pre-chewed.
            </p>
          </div>
        </div>
      </div>

      <div className={s.agentGrid}>
        {agents.map((a, i) => {
          const d = getAgentDetail(a.role);
          return (
            <div key={`${a.name}-${i}`} className={s.agentCard}>
              <div className={s.agentHead}>
                <div className={s.agentNum}>A{String(i + 1).padStart(2, '0')}</div>
                <div className={s.agentAv}>{a.name[0]}</div>
              </div>
              <div className={s.agentName}>{a.name}</div>
              <div className={s.agentRole}>{a.role}</div>
              <p className={s.agentWhat}>{d.what}</p>

              {d.owns.length > 0 && (
                <div className={s.agentOwns}>
                  <div className={s.eyebrow}>§ owns</div>
                  <ul>
                    {d.owns.map((o, j) => (
                      <li key={j}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
