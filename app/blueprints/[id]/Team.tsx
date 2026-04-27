import type { BlueprintPayload } from '@/lib/blueprint/load';
import s from './blueprint.module.css';
import { firstNameOf } from './util';

export function Team({ payload }: { payload: BlueprintPayload }) {
  const { answers, data } = payload;
  const firstName = firstNameOf(answers.name);
  const totalAgents = data.teams.reduce((sum, t) => sum + t.agents.length, 0);

  return (
    <section className={s.page} data-screen-label="Page 03 · Team">
      <div className={s.pageHead}>
        <div className={s.pageNum}>02 / 04</div>
        <div className={s.eyebrow}>§ your unit</div>
        <h2 className={s.pageTitle}>
          One human.
          <br />
          <span className={s.mint}>{totalAgents}</span> agents across{' '}
          <span className={s.mint}>{data.teams.length}</span> teams
          <span className={s.mint}>.</span>
        </h2>
        <p className={s.pageLede}>
          This is the unit we&apos;d build to cover the mint and amber cells across your business.
          Each team is shaped around a slice of work. Each agent is shaped around a slice of that
          team. Human-sounding names because you&apos;ll be working with them like colleagues.
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
              conversations, and the final call on anything that carries risk. The teams below take
              everything else off your plate and bring you the work that needs your judgment,
              pre-chewed.
            </p>
          </div>
        </div>
      </div>

      {data.teams.map((team, ti) => (
        <div key={`${team.name}-${ti}`} className={s.teamSection}>
          <div className={s.teamSectionHead}>
            <div>
              <div className={s.eyebrow}>§ team {String(ti + 1).padStart(2, '0')}</div>
              <h3 className={s.teamSectionName}>{team.name}</h3>
              <div className={s.teamSectionShape}>{team.shape}</div>
            </div>
            <div className={s.teamSectionPct}>
              <span style={{ color: 'var(--coral)' }}>H {team.percentages.human}%</span>
              <span style={{ color: 'var(--amber)' }}>HY {team.percentages.hybrid}%</span>
              <span style={{ color: 'var(--mint)' }}>A {team.percentages.agent}%</span>
            </div>
          </div>

          <div className={s.agentGrid}>
            {team.agents.map((a, i) => (
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
        </div>
      ))}
    </section>
  );
}
