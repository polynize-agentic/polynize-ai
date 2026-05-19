import Image from 'next/image';
import type { Agent, Human } from '@/lib/console-demo/types';
import s from '../console.module.css';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const SIZE_PX: Record<Size, number> = {
  sm: 22,
  md: 28,
  lg: 48,
  xl: 64,
  xxl: 96,
};

const sizeClass: Record<Size, string> = {
  sm: s.avatarSm,
  md: '',
  lg: s.avatarLg,
  xl: s.avatarXl,
  xxl: s.avatarXxl,
};

export function AgentAvatar({
  agent,
  size = 'md',
  portrait = true,
}: {
  agent: Agent;
  size?: Size;
  portrait?: boolean;
}) {
  const classes = [s.avatar, sizeClass[size]];
  if (portrait && agent.portrait) classes.push(s.avatarPortrait);
  else classes.push(colorClass(agent.avatarColor));

  if (portrait && agent.portrait) {
    return (
      <div className={classes.join(' ').trim()}>
        <Image
          src={agent.portrait}
          alt={agent.name}
          width={SIZE_PX[size]}
          height={SIZE_PX[size]}
        />
      </div>
    );
  }
  return <div className={classes.join(' ').trim()}>{agent.initials}</div>;
}

export function HumanAvatar({ human, size = 'md' }: { human: Human; size?: Size }) {
  const classes = [s.avatar, sizeClass[size], s.avatarMuted].filter(Boolean);
  return <div className={classes.join(' ').trim()}>{human.avatar}</div>;
}

export function InitialAvatar({
  initials,
  color = 'mint',
  size = 'md',
}: {
  initials: string;
  color?: 'mint' | 'blue' | 'gold' | 'muted';
  size?: Size;
}) {
  const classes = [s.avatar, sizeClass[size], colorClass(color)].filter(Boolean);
  return <div className={classes.join(' ').trim()}>{initials}</div>;
}

function colorClass(c: 'mint' | 'blue' | 'gold' | 'muted'): string {
  switch (c) {
    case 'mint': return s.avatarMint;
    case 'blue': return s.avatarBlue;
    case 'gold': return s.avatarGold;
    case 'muted': return s.avatarMuted;
  }
}
