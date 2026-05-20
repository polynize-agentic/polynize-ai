import type { TeamOrgParsed } from '@/app/console/_lib/parse-blueprint';
import s from './blueprint-sections.module.css';

type Props = { data: TeamOrgParsed };

function isHumanAgent(role: string): boolean {
  return /\(human\)|\bhuman\b/i.test(role);
}

export function TeamOrg({ data }: Props) {
  const human = data.agents.find((a) => isHumanAgent(a.role));
  const agents = human ? data.agents.filter((a) => a !== human) : data.agents;

  return (
    <div className={s.teamOrg}>
      {human && (
        <div className={s.teamHumanPanel}>
          <div className={s.teamHumanLabel}>Accountable lead</div>
          <h3 className={s.teamHumanName}>{human.name}</h3>
          <div className={s.teamHumanRole}>{human.role}</div>
          <p className={s.teamHumanDescription}>{human.description}</p>
        </div>
      )}

      {data.asciiChart && (
        <pre className={s.teamChart} aria-label="Team org chart">
          {data.asciiChart}
        </pre>
      )}

      {agents.length > 0 && (
        <div className={s.teamAgentGrid}>
          {agents.map((a) => (
            <div key={a.name} className={s.teamAgentCard}>
              <h4 className={s.teamAgentName}>{a.name}</h4>
              <div className={s.teamAgentRole}>{a.role}</div>
              <p className={s.teamAgentDescription}>{a.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
