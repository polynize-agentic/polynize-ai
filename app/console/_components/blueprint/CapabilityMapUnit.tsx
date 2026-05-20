import type { CapabilityMapUnit as CapabilityMapUnitData } from '@/app/console/_lib/parse-blueprint';
import s from './blueprint-sections.module.css';

type Props = { data: CapabilityMapUnitData };

function isNamedOwner(owner: string): boolean {
  // Owners with " · " or "+ " indicate composed or named owners.
  return /\s[+·]\s/.test(owner) || /^[A-Z][a-zA-Z]+\b/.test(owner);
}

export function CapabilityMapUnit({ data }: Props) {
  return (
    <div className={s.capMapUnit}>
      {data.groups.map((group, gi) => (
        <div key={`${gi}-${group.title}`} className={s.capGroup}>
          <h3 className={s.capGroupTitle}>{group.title}</h3>
          <div className={s.capTable}>
            <div className={`${s.capRow} ${s.capRowHead}`}>
              <div className={s.capRowId}>#</div>
              <div className={s.capRowName}>Capability</div>
              <div className={s.capCellHead}>Human</div>
              <div className={s.capCellHead}>Hybrid</div>
              <div className={s.capCellHead}>Agent</div>
              <div className={s.capRowOwnerHead}>Owner</div>
            </div>
            {group.rows.map((row) => (
              <div key={row.id} className={s.capRow}>
                <div className={s.capRowId}>{row.id}</div>
                <div className={s.capRowName}>{row.capability}</div>
                <div className={`${s.capCell} ${row.human ? s.capCellHuman : ''}`}>
                  {row.human ? '●' : ''}
                </div>
                <div className={`${s.capCell} ${row.hybrid ? s.capCellHybrid : ''}`}>
                  {row.hybrid ? '●' : ''}
                </div>
                <div className={`${s.capCell} ${row.agent ? s.capCellAgent : ''}`}>
                  {row.agent ? '●' : ''}
                </div>
                <div
                  className={`${s.capRowOwner} ${
                    isNamedOwner(row.owner) ? s.capRowOwnerNamed : ''
                  }`}
                >
                  {row.owner}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
