'use client';

import { useDraggable } from '@dnd-kit/core';
import type { Task } from '@/lib/console-demo/types';
import { AGENT_BY_ID } from '@/lib/console-demo/seed';
import { AgentAvatar } from './Avatar';
import { CheckIcon, XIcon, SparkleIcon } from './Icons';
import p from './projects.module.css';

type Props = {
  task: Task;
  onApprove?: () => void;
  onReject?: () => void;
};

export function TaskCard({ task, onApprove, onReject }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const agent = AGENT_BY_ID[task.agent];

  const style = {
    transform: undefined,
    transition: 'transform 120ms ease-out',
  };

  const isProposed = task.status === 'proposed';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${p.taskCard} ${task.status === 'doing' ? p.taskCardDoing : ''} ${
        isDragging ? p.taskCardDragging : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className={p.taskTitle}>{task.title}</div>

      {task.evidence && <div className={p.taskEvidence}>{task.evidence}</div>}
      {task.blockedReason && <div className={p.taskBlocked}>⚠ {task.blockedReason}</div>}

      <div className={p.taskMeta}>
        <span className={p.taskUrgency} title={`urgency ${task.urgency}/10`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`${p.taskUrgencyDot} ${i < Math.round(task.urgency / 2) ? p.taskUrgencyDotOn : ''}`}
            />
          ))}
        </span>
        <span className={p.taskByMark} title={task.proposed_by === 'agent' ? 'proposed by agent' : 'proposed by human'}>
          {task.proposed_by === 'agent' ? (
            <SparkleIcon width={11} height={11} />
          ) : (
            '✦'
          )}
        </span>
        {agent && <AgentAvatar agent={agent} size="sm" />}
      </div>

      {isProposed && (onApprove || onReject) && (
        <div className={p.taskActions} onPointerDown={(e) => e.stopPropagation()}>
          {onReject && (
            <button type="button" className={p.taskReject} onClick={onReject}>
              <XIcon width={11} height={11} /> reject
            </button>
          )}
          {onApprove && (
            <button type="button" className={p.taskApprove} onClick={onApprove}>
              <CheckIcon width={11} height={11} /> approve
            </button>
          )}
        </div>
      )}
    </div>
  );
}
