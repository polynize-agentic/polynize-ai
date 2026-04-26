'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PersistedState, Tab, Tweaks } from '@/lib/console/types';
import { DEFAULT_TWEAKS } from '@/lib/console/constants';
import { PROJECTS, TASKS, SEED_ACTIVITY } from '@/lib/console/seed';
import { loadPersisted, savePersisted, clearPersisted, SEED_STATE } from '@/lib/console/persist';
import { simulationTick } from '@/lib/console/simulation';
import { Shell } from './Shell';
import { TweaksPanel } from './TweaksPanel';
import s from '../console.module.css';

export function ConsoleApp() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [openAgentId, setOpenAgentId] = useState<string | null>(null);
  const [projects, setProjects] = useState(PROJECTS);
  const [tasks, setTasks] = useState(TASKS);
  const [activity, setActivity] = useState(SEED_ACTIVITY);
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  // Hydrate
  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) {
      setTab(persisted.tab);
      setOpenProjectId(persisted.openProjectId);
      setOpenAgentId(persisted.openAgentId);
      setProjects(persisted.projects);
      setTasks(persisted.tasks);
      setActivity(persisted.activity);
      setTweaks(persisted.tweaks);
    }
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydratedRef.current) return;
    const state: PersistedState = {
      tab,
      openProjectId,
      openAgentId,
      projects,
      tasks,
      activity,
      tweaks,
    };
    savePersisted(state);
  }, [tab, openProjectId, openAgentId, projects, tasks, activity, tweaks]);

  // Clear isNew flags shortly after insertion so the entry animation runs once
  useEffect(() => {
    if (!activity.some((a) => a.isNew)) return;
    const timer = window.setTimeout(() => {
      setActivity((prev) => prev.map((a) => (a.isNew ? { ...a, isNew: false } : a)));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [activity]);

  // 12s simulation tick — single interval, reads current state via refs
  const tasksRef = useRef(tasks);
  const activityRef = useRef(activity);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { activityRef.current = activity; }, [activity]);
  useEffect(() => {
    const interval = window.setInterval(() => {
      const result = simulationTick(tasksRef.current, activityRef.current);
      setTasks(result.tasks);
      setActivity(result.activity);
    }, 12_000);
    return () => window.clearInterval(interval);
  }, []);

  const pendingApprovals = useMemo(
    () => tasks.filter((t) => t.status === 'proposed').length,
    [tasks]
  );

  const handleTabChange = useCallback((next: Tab) => {
    setTab(next);
    setOpenProjectId(null);
    setOpenAgentId(null);
  }, []);

  const handleTweaksChange = useCallback((patch: Partial<Tweaks>) => {
    setTweaks((prev) => {
      const next = { ...prev, ...patch };
      // global autonomy propagates to all projects
      if (patch.autonomy !== undefined && patch.autonomy !== prev.autonomy) {
        setProjects((prevProjects) =>
          prevProjects.map((p) => ({ ...p, autonomy: patch.autonomy! }))
        );
      }
      return next;
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTweaks((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const handleSimulate = useCallback(() => {
    const result = simulationTick(tasks, activity, 'propose');
    setTasks(result.tasks);
    setActivity(result.activity);
  }, [tasks, activity]);

  const handleReset = useCallback(() => {
    clearPersisted();
    setTab(SEED_STATE.tab);
    setOpenProjectId(null);
    setOpenAgentId(null);
    setProjects(SEED_STATE.projects);
    setTasks(SEED_STATE.tasks);
    setActivity(SEED_STATE.activity);
    setTweaks(SEED_STATE.tweaks);
    setTweaksOpen(false);
  }, []);

  // Keyboard: Esc closes the tweaks panel (and later, modal + drawer)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTweaksOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className={`${s.root} ${tweaks.theme === 'light' ? 'theme-light' : ''}`}
      data-console-depth={tweaks.depth}
      data-console-density={tweaks.density}
    >
      <Shell
        activeTab={tab}
        onTabChange={handleTabChange}
        pendingApprovals={pendingApprovals}
        theme={tweaks.theme}
        onToggleTheme={handleToggleTheme}
        projectCount={projects.length}
        agentCount={4}
        humanCount={5}
      />

      <main className={s.main}>
        {/* Phase 3-5 views render here */}
        {tab === 'dashboard' && (
          <div>
            <div className={s.pageHeader}>
              <div>
                <h1 className={s.pageTitle}>Dashboard</h1>
                <p className={s.pageSub}>
                  {hydrated ? `${pendingApprovals} proposed · ${tasks.filter((t) => t.status === 'doing').length} in flight · ${activity.length} recent events` : 'Loading...'}
                </p>
              </div>
              <button type="button" className={s.btnPrimary}>+ New Project</button>
            </div>
            <p style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 14 }}>
              Dashboard content lands in Phase 3.
            </p>
          </div>
        )}
        {tab === 'projects' && (
          <div>
            <div className={s.pageHeader}>
              <div>
                <h1 className={s.pageTitle}>Projects</h1>
                <p className={s.pageSub}>{projects.length} active</p>
              </div>
              <button type="button" className={s.btnPrimary}>+ New Project</button>
            </div>
            <p style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 14 }}>
              Projects list + detail land in Phase 4.
            </p>
          </div>
        )}
        {tab === 'agents' && (
          <div>
            <div className={s.pageHeader}>
              <h1 className={s.pageTitle}>Agents</h1>
            </div>
            <p style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 14 }}>
              Agents list + drawer land in Phase 5.
            </p>
          </div>
        )}
        {tab === 'humans' && (
          <div>
            <div className={s.pageHeader}>
              <h1 className={s.pageTitle}>Humans</h1>
            </div>
            <p style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 14 }}>
              Humans table lands in Phase 5.
            </p>
          </div>
        )}
      </main>

      <TweaksPanel
        open={tweaksOpen}
        tweaks={tweaks}
        onToggle={() => setTweaksOpen((v) => !v)}
        onChange={handleTweaksChange}
        onSimulate={handleSimulate}
        onReset={handleReset}
      />
    </div>
  );
}
