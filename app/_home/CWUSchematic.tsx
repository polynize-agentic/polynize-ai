'use client';

import { useState } from 'react';
import s from './home.module.css';

const AGENTS = ['A1', 'A2', 'A3', 'A4'];
const AX = [60, 140, 220, 300];
const AY = 200;
const HX = 180;
const HY = 60;

export function CWUSchematic() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className={s.schematic}>
      <div className={s.schematicHead}>
        <div>// unit schematic</div>
        <div>1 : 4</div>
      </div>
      <svg viewBox="0 0 360 280" style={{ width: '100%' }}>
        <defs>
          <radialGradient id="humanGlowB" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#f0e1b6" stopOpacity=".25" />
            <stop offset="1" stopColor="#f0e1b6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {AX.map((x, i) => (
          <line
            key={i}
            x1={HX}
            y1={HY + 28}
            x2={x}
            y2={AY}
            stroke={hover === i ? 'var(--mint)' : 'var(--border)'}
            strokeWidth={hover === i ? 1.5 : 1}
            style={{ transition: 'all .2s' }}
          />
        ))}

        <circle cx={HX} cy={HY + 4} r="48" fill="url(#humanGlowB)" />

        <g>
          <circle cx={HX} cy={HY - 4} r="10" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
          <path
            d={`M ${HX - 18} ${HY + 22} Q ${HX - 18} ${HY + 8} ${HX} ${HY + 8} Q ${HX + 18} ${HY + 8} ${HX + 18} ${HY + 22}`}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
        <text
          x={HX}
          y={HY + 40}
          textAnchor="middle"
          fontSize="9"
          fill="var(--text-3)"
          style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}
        >
          HUMAN · JUDGMENT
        </text>

        {AX.map((x, i) => {
          const on = hover === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x - 24}
                y={AY}
                width="48"
                height="28"
                fill={on ? 'var(--mint)' : 'var(--surface-2)'}
                stroke={on ? 'var(--mint)' : 'var(--border)'}
                rx="2"
                style={{ transition: 'all .2s' }}
              />
              <text
                x={x}
                y={AY + 18}
                textAnchor="middle"
                fontSize="11"
                fill={on ? 'var(--bg)' : 'var(--mint)'}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}
              >
                {AGENTS[i]}
              </text>
            </g>
          );
        })}
        <text
          x={HX}
          y={AY + 48}
          textAnchor="middle"
          fontSize="9"
          fill="var(--text-3)"
          style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}
        >
          AGENTS · EXECUTION
        </text>
      </svg>
    </div>
  );
}
