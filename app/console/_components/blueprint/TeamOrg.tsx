import type { TeamOrgParsed } from '@/app/console/_lib/parse-blueprint';
import { identifyTeamRoles } from '@/app/console/_lib/parse-blueprint';
import s from './blueprint-sections.module.css';

type Props = { data: TeamOrgParsed };

export function TeamOrg({ data }: Props) {
  const { accountableLead, spoc, children } = identifyTeamRoles(data);

  return (
    <div className={s.teamOrg}>
      {/* Structured org chart */}
      <div className={s.orgChart}>
        {accountableLead && (
          <>
            <div className={s.teamHumanPanel}>
              <div className={s.teamHumanLabel}>Accountable lead</div>
              <h3 className={s.teamHumanName}>{accountableLead.name}</h3>
              <div className={s.teamHumanRole}>{accountableLead.role}</div>
              <p className={s.teamHumanDescription}>
                {accountableLead.description}
              </p>
            </div>
            {spoc && <div className={s.orgConnectorVertical} aria-hidden />}
          </>
        )}

        {spoc && (
          <div className={s.orgSpocRow}>
            <div className={s.orgSpocCard}>
              <h4 className={s.orgSpocName}>{spoc.name}</h4>
              <div className={s.orgSpocRole}>{spoc.role}</div>
            </div>
          </div>
        )}

        {spoc && children.length > 0 && (
          <div className={s.orgConnectorVerticalShort} aria-hidden />
        )}

        {children.length > 0 && (
          <div
            className={s.orgChildrenWrap}
            style={{ ['--children-count' as string]: children.length }}
          >
            <div className={s.orgHorizontalConnector} aria-hidden />
            <div className={s.orgChildrenRow}>
              {children.map((child) => (
                <div key={child.name} className={s.orgChildCard}>
                  <h4 className={s.orgChildName}>{child.name}</h4>
                  <div className={s.orgChildRole}>{child.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail grid below — full description per agent */}
      {data.agents.length > 0 && (
        <div className={s.teamAgentGrid}>
          {data.agents.map((a) => (
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
