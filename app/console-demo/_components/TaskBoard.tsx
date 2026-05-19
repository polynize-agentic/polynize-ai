'use client';

import { DndContext, useDroppable, closestCorners, type DragEndEvent } from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/lib/console-demo/types';
import { TASK_STATUSES } from '@/lib/console-demo/constants';
import { TaskCard } from './TaskCard';
import p from './projects.module.css';

type Props = {
  tasks: Task[];
  onAction: (taskId: string, action: 'approve' | 'reject' | 'move', arg?: TaskStatus) => void;
};

const COLUMN_LABELS: Record<TaskStatus, string> = {
  proposed: 'Proposed',
  todo: 'Todo',
  doing: 'Doing',
  blocked: 'Blocked',
  done: 'Done',
};

export function TaskBoard({ tasks, onAction }: Props) {
  const handleDragEnd = (e: DragEndEvent) => {
    const taskId = String(e.active.id);
    const newStatus = e.over?.id as TaskStatus | undefined;
    if (!newStatus || !TASK_STATUSES.includes(newStatus)) return;
    onAction(taskId, 'move', newStatus);
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className={p.taskBoard}>
        {TASK_STATUSES.map((status) => (
          <Column key={status} status={status} label={COLUMN_LABELS[status]}>
            {tasks
              .filter((t) => t.status === status)
              .map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onApprove={status === 'proposed' ? () => onAction(t.id, 'approve') : undefined}
                  onReject={status === 'proposed' ? () => onAction(t.id, 'reject') : undefined}
                />
              ))}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}

function Column({
  status,
  label,
  children,
}: {
  status: TaskStatus;
  label: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const childArr = Array.isArray(children) ? children : [children];
  return (
    <div
      ref={setNodeRef}
      className={`${p.taskColumn} ${status === 'proposed' ? p.taskColumnProposed : ''} ${
        isOver ? p.taskColumnDropping : ''
      }`}
    >
      <div className={p.taskColumnHead}>
        <span>{label}</span>
        <span className={p.taskColumnCount}>{childArr.filter(Boolean).length}</span>
      </div>
      {children}
    </div>
  );
}
