
import {
  ArrowRight,
  Check,
} from 'lucide-react';

import { Task } from '@/lib/api';

type TaskRowProps = {
  task: Task;
  onClick?: () => void;
};

export default function TaskRow({
  task,
  onClick,
}: TaskRowProps) {
  const completed = task.status === 'COMPLETED';

  const status =
    task.status === 'COMPLETED'
      ? {
          wrapper:
            'border-purple-400/10 bg-purple-400/[0.06] text-purple-300',
          dot: 'bg-purple-400',
        }
      : task.status === 'IN_PROGRESS'
        ? {
            wrapper:
              'border-orange-400/10 bg-orange-400/[0.06] text-orange-300',
            dot: 'bg-orange-400',
          }
        : {
            wrapper:
              'border-sky-400/10 bg-sky-400/[0.06] text-sky-300',
            dot: 'bg-sky-400',
          };

  const priority =
    task.priority === 'URGENT'
      ? 'border-red-400/10 bg-red-400/[0.06] text-red-300'
      : task.priority === 'HIGH'
        ? 'border-orange-400/10 bg-orange-400/[0.06] text-orange-300'
        : task.priority === 'MEDIUM'
          ? 'border-yellow-400/10 bg-yellow-400/[0.05] text-yellow-300'
          : 'border-white/[0.07] bg-white/[0.03] text-white/35';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.018] sm:px-6 lg:grid-cols-[auto_minmax(220px,1fr)_minmax(150px,0.6fr)_auto_auto_auto]"
    >
      {/* Status icon */}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
          completed
            ? 'border-purple-400/20 bg-purple-400/[0.08] text-purple-300'
            : 'border-white/[0.07] bg-white/[0.02] text-white/20'
        }`}
      >
        {completed ? (
          <Check className="h-4 w-4" />
        ) : (
          <span className="h-2 w-2 rounded-full border border-white/20" />
        )}
      </div>

      {/* Task */}
      <div className="min-w-0">
        <h3
          className={`truncate text-sm font-medium ${
            completed
              ? 'text-white/40 line-through'
              : 'text-white/75'
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1 truncate text-[11px] text-white/25">
            {task.description}
          </p>
        )}
      </div>

      {/* Assignee */}
      <div className="hidden min-w-0 items-center gap-2 lg:flex">
        {task.assignedTo ? (
          <>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[8px] font-semibold text-white/45">
              {getInitials(task.assignedTo.name)}
            </div>

            <span className="truncate text-[11px] text-white/35">
              {task.assignedTo.name}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-white/20">
            Unassigned
          </span>
        )}
      </div>

      {/* Status */}
      <span
        className={`hidden items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-medium sm:flex ${status.wrapper}`}
      >
        <i
          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
        />

        {formatStatus(task.status)}
      </span>

      {/* Priority */}
      <span
        className={`hidden whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-medium md:inline-flex ${priority}`}
      >
        {task.priority}
      </span>

      {/* Arrow */}
      <ArrowRight className="h-4 w-4 text-white/15 transition-all group-hover:translate-x-1 group-hover:text-[#39ff14]/60" />
    </button>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatStatus(status: Task['status']) {
  return status
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
