
'use client';

import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Flag,
  User,
  X,
} from 'lucide-react';

import { Task } from '@/lib/api';

type TaskDetailsModalProps = {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
};

export default function TaskDetailsModal({
  task,
  open,
  onClose,
  onEdit,
}: TaskDetailsModalProps) {
  if (!open || !task) return null;

  const status = getStatusStyle(task.status);
  const priority = getPriorityStyle(task.priority);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="Close task details"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07100d]/95 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        {/* Green glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#39ff14]/10 blur-[100px]" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5 sm:px-7">
            <div className="min-w-0 pr-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.9)]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#39ff14]/65">
                  Task details
                </span>
              </div>

              <h2 className="truncate text-xl font-semibold text-white/90 sm:text-2xl">
                {task.title}
              </h2>

              <p className="mt-1 text-[11px] text-white/25">
                Task #{task.id}
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[65vh] overflow-y-auto px-6 py-6 sm:px-7">
            {/* Description */}
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">
                Description
              </span>

              <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-white/55">
                  {task.description ||
                    'No description provided for this task.'}
                </p>
              </div>
            </div>

            {/* Status + Priority */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Status"
              >
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-medium ${status.wrapper}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                  />

                  {formatStatus(task.status)}
                </span>
              </InfoCard>

              <InfoCard
                icon={<Flag className="h-4 w-4" />}
                label="Priority"
              >
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-medium ${priority}`}
                >
                  {task.priority}
                </span>
              </InfoCard>
            </div>

            {/* Assignee + Due date */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<User className="h-4 w-4" />}
                label="Assigned to"
              >
                {task.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#39ff14]/15 bg-[#39ff14]/[0.07] text-[9px] font-semibold text-[#39ff14]">
                      {getInitials(task.assignedTo.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white/70">
                        {task.assignedTo.name}
                      </p>

                      <p className="truncate text-[10px] text-white/25">
                        {task.assignedTo.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-white/25">
                    Unassigned
                  </span>
                )}
              </InfoCard>

              <InfoCard
                icon={<Calendar className="h-4 w-4" />}
                label="Due date"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">
                    {formatDate(task.dueDate)}
                  </span>

                  {task.dueDate && isOverdue(task) && (
                    <span className="rounded-full border border-red-400/10 bg-red-400/[0.06] px-2 py-1 text-[9px] text-red-300">
                      Overdue
                    </span>
                  )}
                </div>
              </InfoCard>
            </div>

            {/* Dates */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<Clock className="h-4 w-4" />}
                label="Created"
              >
                <span className="text-xs text-white/50">
                  {formatDateTime(task.createdAt)}
                </span>
              </InfoCard>

              <InfoCard
                icon={<Clock className="h-4 w-4" />}
                label="Last updated"
              >
                <span className="text-xs text-white/50">
                  {formatDateTime(task.updatedAt)}
                </span>
              </InfoCard>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white"
            >
              Close
            </button>

            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.09] px-5 py-2.5 text-xs font-semibold text-[#b9ffad] transition hover:border-[#39ff14]/40 hover:bg-[#39ff14]/[0.14]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable pieces                                                            */
/* -------------------------------------------------------------------------- */

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
      <div className="mb-3 flex items-center gap-2 text-white/25">
        {icon}

        <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>

      {children}
    </div>
  );
}

function getStatusStyle(status: Task['status']) {
  if (status === 'COMPLETED') {
    return {
      wrapper:
        'border-purple-400/10 bg-purple-400/[0.06] text-purple-300',
      dot: 'bg-purple-400',
    };
  }

  if (status === 'IN_PROGRESS') {
    return {
      wrapper:
        'border-orange-400/10 bg-orange-400/[0.06] text-orange-300',
      dot: 'bg-orange-400',
    };
  }

  return {
    wrapper:
      'border-sky-400/10 bg-sky-400/[0.06] text-sky-300',
    dot: 'bg-sky-400',
  };
}

function getPriorityStyle(
  priority: Task['priority'],
) {
  if (priority === 'URGENT') {
    return 'border-red-400/10 bg-red-400/[0.06] text-red-300';
  }

  if (priority === 'HIGH') {
    return 'border-orange-400/10 bg-orange-400/[0.06] text-orange-300';
  }

  if (priority === 'MEDIUM') {
    return 'border-yellow-400/10 bg-yellow-400/[0.05] text-yellow-300';
  }

  return 'border-white/[0.07] bg-white/[0.03] text-white/35';
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

function formatDate(date: string | null) {
  if (!date) return 'No due date';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return false;
  }

  return new Date(task.dueDate).getTime() < Date.now();
}

