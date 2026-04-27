'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Answers, MultiTeamHeatMap, HeatMapAgent } from '@/lib/types';
import { buildAgentSystemPrompt } from '@/lib/agents/system-prompt';
import { track } from '@/lib/analytics';
import { persistMessage, createBlueprint } from '@/lib/persist-client';
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
  data: MultiTeamHeatMap;
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

type FlatAgent = HeatMapAgent & { teamName: string };

export function PhaseC({ answers, data, initialMessages, onMessagesChange, onBack }: Props) {
  const flatAgents: FlatAgent[] = useMemo(
    () => data.teams.flatMap((t) => t.agents.map((a) => ({ ...a, teamName: t.name }))),
    [data.teams]
  );
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0] ?? '';
  const company = (answers.company ?? '').trim();

  const [activeAgent, setActiveAgent] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) return initialMessages;
    if (flatAgents.length === 0) return [];
    return [seedGreeting(flatAgents[0], firstName, company, answers.business_description ?? '')];
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
      const agent = flatAgents[activeAgent];
      if (!agent) return;

      const userMsg: ChatMessage = { role: 'user', content: trimmed };
      const newHistory = [...messages, userMsg];
      setMessages(newHistory);
      setInput('');
      setLoading(true);
      track('phase_c_message', { agent_id: agent.role, message_count: newHistory.length });
      persistMessage('user', trimmed);

      const system = buildAgentSystemPrompt(agent, agent.teamName, answers, data);
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
        persistMessage('assistant', replyText, agent.role);
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
    [activeAgent, flatAgents, answers, data, loading, messages]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const sendMyBlueprint = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    const res = await createBlueprint();
    if ('id' in res) {
      track('blueprint_created', { id: res.id, shape_id: data.shape_primary });
      window.location.href = `/blueprints/${res.id}`;
      return;
    }
    setCreateError(res.error);
    setCreating(false);
  }, [creating, data.shape_primary]);

  if (flatAgents.length === 0) {
    return (
      <div className={s.phaseC}>
        <div className={s.right}>
          <p style={{ padding: 32 }}>No agents available. Reset the session and try again.</p>
        </div>
      </div>
    );
  }

  const active = flatAgents[activeAgent];

  return (
    <div className={s.phaseC}>
      <aside className={s.left}>
        <div className={s.miniHead}>
          <button type="button" className={s.back} onClick={onBack}>
            ← heat_map
          </button>
          <div className={s.miniTitle}>§ your unit</div>
        </div>
        <div className={s.teamList}>
          {data.teams.map((team, ti) => (
            <div key={`${team.name}-${ti}`} className={s.teamGroup}>
              <div className={s.teamGroupHead}>{team.name}</div>
              {team.agents.map((a) => {
                const flatIndex = flatAgents.findIndex((f) => f.name === a.name && f.teamName === team.name);
                const isActive = flatIndex === activeAgent;
                return (
                  <button
                    key={`${team.name}-${a.name}`}
                    type="button"
                    className={`${s.teamItem} ${isActive ? s.teamItemOn : ''}`}
                    onClick={() => {
                      if (flatIndex !== activeAgent) {
                        track('phase_c_agent_switch', {
                          from_agent: flatAgents[activeAgent]?.role,
                          to_agent: a.role,
                        });
                      }
                      setActiveAgent(flatIndex);
                    }}
                  >
                    <div className={`${s.avatar} ${isActive ? s.avatarActive : ''}`}>{a.name[0]}</div>
                    <div className={s.teamGrow}>
                      <div className={s.teamName}>{a.name}</div>
                      <div className={s.teamRole}>{a.role}</div>
                    </div>
                    {isActive && <span className={s.dot} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className={s.miniStat}>
          <div className={s.eyebrow}>shape</div>
          <div className={s.miniStatV}>{data.shape_primary}</div>
        </div>
      </aside>

      <section className={s.right}>
        <div className={s.chatHead}>
          <div>
            <div className={s.eyebrow} style={{ marginBottom: 4 }}>
              talking to
            </div>
            <div className={s.chatName}>
              {active.name} <span className={s.chatRoleSuffix}>· {active.role} · {active.teamName}</span>
            </div>
          </div>
          <div className={s.headRight}>
            <div className={s.live}>
              <span className={s.liveDot} /> online
            </div>
            <button
              type="button"
              className={s.sendBlueprintBtn}
              onClick={sendMyBlueprint}
              disabled={creating}
              aria-label="Send me my Blueprint"
            >
              {creating ? 'sending…' : 'send my blueprint →'}
            </button>
          </div>
        </div>
        {createError && (
          <div className={s.createError} role="alert">
            {createError}
          </div>
        )}

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
  agent: FlatAgent,
  firstName: string,
  company: string,
  business: string
): ChatMessage {
  const greet = firstName ? `Hi ${firstName}, ` : 'Hi, ';
  const focus = (business || 'what you described').toLowerCase().replace(/\.$/, '');
  const companyNote = company
    ? ` I know ${company} is focused on ${focus}.`
    : business
      ? ` I've read your notes on "${business}".`
      : '';
  return {
    role: 'assistant',
    content: `${greet}I'm ${agent.name}, your ${agent.role} on the ${agent.teamName} team.${companyNote} Ask me anything, or pick a starter below.`,
    agentName: agent.name,
    agentRole: agent.role,
  };
}
