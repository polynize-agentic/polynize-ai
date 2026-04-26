'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Answers, HeatMapData, TeamMember } from '@/lib/types';
import { buildAgentSystemPrompt } from '@/lib/agents/system-prompt';
import { track } from '@/lib/analytics';
import s from './phase-c.module.css';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  agentName?: string;
  agentRole?: string;
  isError?: boolean;
  retryText?: string;
};

type Props = {
  answers: Partial<Answers>;
  data: HeatMapData;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onBack: () => void;
};

const STARTERS = [
  'Walk me through a typical day with this team',
  'What should I work on first thing tomorrow?',
  "How do you decide what's Agent vs Hybrid vs Human?",
  'Show me a sample deliverable from Week 1',
];

const FALLBACK_GENERIC = "I'm having trouble reaching my context. Try again in a moment?";
const FALLBACK_RATE_LIMIT = "We're answering a lot of questions right now. Wait a few seconds and resend.";
const FALLBACK_OFFLINE = 'Chat is in maintenance mode. We will be back shortly.';

function fallbackForStatus(status: number | null): string {
  if (status === 429) return FALLBACK_RATE_LIMIT;
  if (status === 401 || status === 403 || status === 503) return FALLBACK_OFFLINE;
  return FALLBACK_GENERIC;
}

export function PhaseC({ answers, data, initialMessages, onMessagesChange, onBack }: Props) {
  const agents = useMemo(() => data.team.filter((m): m is TeamMember => m.type === 'agent'), [data.team]);
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] ?? '';
  const company = (answers.q1_company ?? '').trim();

  const [activeAgent, setActiveAgent] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) return initialMessages;
    if (agents.length === 0) return [];
    return [seedGreeting(agents[0], firstName, company, answers.q3 ?? '')];
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const skipNextNotify = useRef(true);

  // Auto-scroll on new message or loading state
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Bubble messages up to controller for persistence (skip first run).
  useEffect(() => {
    if (skipNextNotify.current) {
      skipNextNotify.current = false;
      return;
    }
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const agent = agents[activeAgent];
      if (!agent) return;

      const userMsg: ChatMessage = { role: 'user', content: trimmed };
      const newHistory = [...messages, userMsg];
      setMessages(newHistory);
      setInput('');
      setLoading(true);
      track('phase_c_message', { agent_id: agent.role, message_count: newHistory.length });

      const system = buildAgentSystemPrompt(agent, answers, data);
      const apiMessages = newHistory.map(({ role, content }) => ({ role, content }));

      let status: number | null = null;
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system, messages: apiMessages }),
        });
        status = res.status;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { text: replyText } = (await res.json()) as { text: string };
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: replyText, agentName: agent.name, agentRole: agent.role },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: fallbackForStatus(status),
            agentName: agent.name,
            agentRole: agent.role,
            isError: true,
            retryText: trimmed,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [activeAgent, agents, answers, data, loading, messages]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  if (agents.length === 0) {
    return (
      <div className={s.phaseC}>
        <div className={s.right}>
          <p style={{ padding: 32 }}>No agents available. Reset the session and try again.</p>
        </div>
      </div>
    );
  }

  const active = agents[activeAgent];

  return (
    <div className={s.phaseC}>
      <aside className={s.left}>
        <div className={s.miniHead}>
          <button type="button" className={s.back} onClick={onBack}>
            ← heat_map
          </button>
          <div className={s.miniTitle}>§ your team</div>
        </div>
        <div className={s.teamList}>
          {agents.map((a, i) => (
            <button
              key={`${a.name}-${i}`}
              type="button"
              className={`${s.teamItem} ${i === activeAgent ? s.teamItemOn : ''}`}
              onClick={() => {
                if (i !== activeAgent) {
                  track('phase_c_agent_switch', {
                    from_agent: agents[activeAgent]?.role,
                    to_agent: a.role,
                  });
                }
                setActiveAgent(i);
              }}
            >
              <div className={`${s.avatar} ${i === activeAgent ? s.avatarActive : ''}`}>
                {a.name[0]}
              </div>
              <div className={s.teamGrow}>
                <div className={s.teamName}>{a.name}</div>
                <div className={s.teamRole}>{a.role}</div>
              </div>
              {i === activeAgent && <span className={s.dot} />}
            </button>
          ))}
        </div>
        <div className={s.miniStat}>
          <div className={s.eyebrow}>shape</div>
          <div className={s.miniStatV}>{data.shape_display_name}</div>
        </div>
      </aside>

      <section className={s.right}>
        <div className={s.chatHead}>
          <div>
            <div className={s.eyebrow} style={{ marginBottom: 4 }}>
              talking to
            </div>
            <div className={s.chatName}>
              {active.name} <span className={s.chatRoleSuffix}>· {active.role}</span>
            </div>
          </div>
          <div className={s.live}>
            <span className={s.liveDot} /> online
          </div>
        </div>

        <div
          className={s.msgs}
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label={`Conversation with ${active.name}`}
        >
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            const speaker = isUser ? 'You' : (m.agentName ?? 'Agent');
            return (
              <div
                key={i}
                className={`${s.msg} ${isUser ? s.msgUser : ''}`}
                role="article"
                aria-label={`${speaker}: ${m.content}`}
              >
                {!isUser && (
                  <div className={`${s.avatar} ${s.avatarSm}`} aria-hidden="true">
                    {m.agentName?.[0] ?? '·'}
                  </div>
                )}
                <div className={`${s.bubble} ${isUser ? s.bubbleUser : ''}`}>
                  {!isUser && m.agentName && <div className={s.bubbleName}>{m.agentName}</div>}
                  <div className={s.bubbleText}>{m.content}</div>
                  {m.isError && m.retryText && (
                    <button
                      type="button"
                      className={s.retryBtn}
                      onClick={() => {
                        setMessages((prev) => prev.slice(0, -2));
                        setTimeout(() => send(m.retryText!), 0);
                      }}
                    >
                      retry →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className={s.msg} aria-label={`${active.name} is typing`}>
              <div className={`${s.avatar} ${s.avatarSm}`} aria-hidden="true">
                {active.name[0]}
              </div>
              <div className={s.bubble}>
                <div className={s.bubbleName}>{active.name}</div>
                <div className={s.typing} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !loading && (
          <div className={s.starters}>
            {STARTERS.map((label) => (
              <button key={label} type="button" className={s.starter} onClick={() => send(label)}>
                {label}
              </button>
            ))}
          </div>
        )}

        <form className={s.composer} onSubmit={onSubmit} aria-label="Send message">
          <label htmlFor="phase-c-input" className="sr-only">
            Message {active.name}
          </label>
          <input
            id="phase-c-input"
            className={s.input}
            placeholder={`Message ${active.name}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            aria-label={`Message ${active.name}`}
          />
          <button
            type="submit"
            className={s.send}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            send →
          </button>
        </form>
      </section>
    </div>
  );
}

function seedGreeting(
  agent: TeamMember,
  firstName: string,
  company: string,
  q3: string
): ChatMessage {
  const greet = firstName ? `Hi ${firstName}, ` : 'Hi, ';
  const focus = (q3 || 'the outcome you mentioned').toLowerCase().replace(/\.$/, '');
  const companyNote = company
    ? ` I know ${company} is focused on ${focus}.`
    : q3
      ? ` I've read your notes on "${q3}".`
      : '';
  return {
    role: 'assistant',
    content: `${greet}I'm ${agent.name}, your ${agent.role}.${companyNote} Ask me anything, or pick a starter below.`,
    agentName: agent.name,
    agentRole: agent.role,
  };
}
