import type { Human } from '@/lib/console/types';
import { HumanAvatar } from './Avatar';
import s from '../console.module.css';
import a from './agents.module.css';

type Props = {
  humans: Human[];
};

export function HumansList({ humans }: Props) {
  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Humans</h1>
          <p className={s.pageSub}>{humans.length} on the workspace</p>
        </div>
      </div>

      <div className={a.humansTable}>
        <div className={a.humansHead}>
          <span>Person</span>
          <span>Email</span>
          <span>Role</span>
          <span>Projects</span>
        </div>
        {humans.map((h) => (
          <div key={h.id} className={a.humanRow}>
            <div className={a.humanName}>
              <HumanAvatar human={h} size="md" />
              {h.name}
            </div>
            <div className={a.humanEmail}>{h.email}</div>
            <span className={`${a.humanRolePill} ${h.role === 'admin' ? a.humanRolePillAdmin : ''}`}>
              {h.role}
            </span>
            <div className={a.humanProjects}>
              {h.projects.length} {h.projects.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
