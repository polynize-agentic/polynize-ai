import type { AgentCapabilityCard } from '@/app/console/_lib/parse-blueprint';
import s from './blueprint-sections.module.css';

type Props = { data: AgentCapabilityCard[] };

export function CapabilityMapAgent({ data }: Props) {
  return (
    <div className={s.capMapAgentGrid}>
      {data.map((card) => (
        <div
          key={card.name}
          className={`${s.agentCard} ${card.isHuman ? s.agentCardHuman : s.agentCardAgent}`}
        >
          <div className={s.agentCardHeader}>
            <h3 className={s.agentCardName}>{card.name}</h3>
            {card.roleParts.length > 0 && (
              <div className={s.agentCardRole}>{card.roleParts.join(' · ')}</div>
            )}
          </div>
          {card.description && (
            <p className={s.agentCardDescription}>{card.description}</p>
          )}
          {card.capabilities.length > 0 && (
            <ul className={s.agentCardList}>
              {card.capabilities.map((cap, ci) => {
                const isBoundary = /^\*Boundary:?\*/i.test(cap);
                return (
                  <li
                    key={ci}
                    className={isBoundary ? s.agentCardBoundary : s.agentCardCap}
                  >
                    {cap.replace(/^\*Boundary:?\*\s*/i, isBoundary ? 'Boundary: ' : '')}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
