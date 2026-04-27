import type { CSSProperties } from 'react';
import type { BlueprintPayload } from '@/lib/blueprint/load';
import { computePricing } from '@/lib/pricing';
import s from './blueprint.module.css';
import { firstNameOf } from './util';

type Stage = {
  stage: string;
  from: string;
  unit: string;
  window: string;
  what: string;
  scope: string[];
  accent: 'mint' | 'amber';
  featured?: boolean;
};

export function Pricing({ payload }: { payload: BlueprintPayload }) {
  const { answers, data } = payload;
  const firstName = firstNameOf(answers.name, 'you');
  const totalAgents = data.teams.reduce((sum, t) => sum + t.agents.length, 0);
  const teamCount = data.teams.length;
  const company = (answers.company ?? '').trim();
  const pricing = computePricing(answers);

  const stages: Stage[] = [
    {
      stage: 'Map',
      from: `from $${pricing.map.from.toLocaleString()}`,
      unit: 'AUD, one-off',
      window: 'Week 1 to 2',
      what:
        'We set up the cognitive layer and ship your first agent live. You see the heat map become real. The cheapest way to de-risk the rest of the decision.',
      scope: [
        'One agent deployed end-to-end',
        'Cognitive layer installed in your tools',
        `Workshop with you on your ${teamCount}-team heat map`,
        'Decision checkpoint before Transform',
      ],
      accent: 'mint',
    },
    {
      stage: 'Transform',
      from: `from $${pricing.transform.from.toLocaleString()}`,
      unit: 'AUD, scales with unit size',
      window: `Week 3 to ${Math.max(6, teamCount * 3)}`,
      what: `The full unit, ${totalAgents} agents across ${teamCount} teams, built, trained in your voice, plugged into your tools, and deployed behind the human lead. This is where your calendar starts clearing.`,
      scope: [
        `${totalAgents} agents designed, built and trained`,
        `${teamCount} teams structured around your work`,
        'Integration with your existing toolchain',
        'Human-in-the-loop review flows',
        'Handoff: you, running the unit',
      ],
      accent: 'amber',
      featured: true,
    },
    {
      stage: 'Operate',
      from: `from $${pricing.operate.from_per_month.toLocaleString()}`,
      unit: 'AUD / month, service fee',
      window: 'Ongoing',
      what:
        'We keep the unit healthy. Prompts tuned, tools updated, connectors working, and a monthly check-in on how each team is actually performing against your metric.',
      scope: [
        'Monthly monitoring and tuning',
        'Connector maintenance',
        'Quarterly agent review',
        'Direct line to your Polynize team',
      ],
      accent: 'mint',
    },
  ];

  return (
    <section className={s.page} data-screen-label="Page 05 · Pricing">
      <div className={s.pageHead}>
        <div className={s.pageNum}>04 / 04</div>
        <div className={s.eyebrow}>§ how we&apos;d build this</div>
        <h2 className={s.pageTitle}>
          Map, Transform,
          <br />
          Operate<span className={s.mint}>.</span>
        </h2>
        <p className={s.pageLede}>
          Three stages. Each one earns the next. These are indicative bands, {firstName}. The exact
          numbers for {company || 'your team'} get locked in a 30-minute conversation.
        </p>
      </div>

      <div className={s.priceGrid}>
        {stages.map((st, i) => {
          const col = st.accent === 'mint' ? 'var(--mint)' : 'var(--amber)';
          const cardStyle = { '--card-accent': col } as CSSProperties;
          return (
            <div
              key={st.stage}
              className={`${s.priceCard} ${st.featured ? s.priceCardFeatured : ''}`}
              style={cardStyle}
            >
              <div className={s.priceStage}>
                <span className={s.priceNum}>0{i + 1}</span>
                <span className={s.priceTitle}>{st.stage}</span>
              </div>
              <div className={s.priceWindow}>{st.window}</div>

              <div className={s.pricePrice}>
                <div className={s.priceFrom}>{st.from}</div>
                <div className={s.priceUnit}>{st.unit}</div>
              </div>

              <p className={s.priceWhat}>{st.what}</p>

              <ul className={s.priceScope}>
                {st.scope.map((item, j) => (
                  <li key={j}>
                    <span className={s.tick}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className={s.fine}>
        Bands, not quotes. All prices indicative and subject to scope lock-in on a call.
      </div>
    </section>
  );
}
