
'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
} from 'lucide-react';

import {
  Task,
  updateTaskStatus,
} from '@/lib/api';

type TaskRowProps = {
  task: Task;
  onClick?: () => void;
  onUpdated?: () => Promise<void> | void;
};

export default function TaskRow({
  task,
  onClick,
  onUpdated,
}: TaskRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const completed =
    task.status === 'COMPLETED';

  const status = getStatusStyle(
    task.status,
  );

  const priority = getPriorityStyle(
    task.priority,
  );

  /* =========================
     CHANGE STATUS
  ========================= */

  const handleStatusChange = async (
    newStatus: Task['status'],
  ) => {
    if (newStatus === task.status) {
      setMenuOpen(false);
      return;
    }

    try {
      setUpdating(true);

      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/';
        return;
      }

      await updateTaskStatus(
        token,
        task.id,
        newStatus,
      );

      setMenuOpen(false);

      await onUpdated?.();
    } catch (error) {
      console.error(
        'Unable to update task status:',
        error,
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =========================
     QUICK COMPLETE TOGGLE
  ========================= */

  const handleToggleComplete = async () => {
    const newStatus = completed
      ? 'TODO'
      : 'COMPLETED';

    await handleStatusChange(newStatus);
  };

  return (
    <div
      className="
        group relative grid w-full
        grid-cols-[auto_1fr_auto]
        items-center gap-4
        px-5 py-4
        transition-colors
        hover:bg-white/[0.018]
        sm:px-6
        lg:grid-cols-[auto_minmax(220px,1fr)_minmax(150px,0.6fr)_auto_auto_auto]
      "
    >
      {/* =========================
          QUICK COMPLETE
      ========================= */}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleToggleComplete();
        }}
        disabled={updating}
        aria-label={
          completed
            ? 'Mark task as to do'
            : 'Mark task as completed'
        }
        className="
          flex h-8 w-8 items-center
          justify-center rounded-lg
          border border-white/[0.07]
          transition
          hover:border-white/[0.14]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <div
          className={`
            flex h-full w-full
            items-center justify-center
            rounded-lg
            ${
              completed
                ? 'border border-purple-400/20 bg-purple-400/[0.08] text-purple-300'
                : 'border border-white/[0.07] bg-white/[0.02] text-white/20'
            }
          `}
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : completed ? (
            <Check className="h-4 w-4" />
          ) : (
            <span className="h-2 w-2 rounded-full border border-white/20" />
          )}
        </div>
      </button>

      {/* =========================
          TASK
      ========================= */}

      <button
        type="button"
        onClick={onClick}
        className="min-w-0 text-left"
      >
        <h3
          className={`
            truncate text-sm font-medium
            ${
              completed
                ? 'text-white/40 line-through'
                : 'text-white/75'
            }
          `}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1 truncate text-[11px] text-white/25">
            {task.description}
          </p>
        )}
      </button>

      {/* =========================
          ASSIGNED USER
      ========================= */}

      <div className="hidden min-w-0 items-center gap-2 lg:flex">
        {task.assignedTo ? (
          <>
            <div
              className="
                flex h-7 w-7 shrink-0
                items-center justify-center
                rounded-full
                border border-white/[0.08]
                bg-white/[0.04]
                text-[8px] font-semibold
                text-white/45
              "
            >
              {getInitials(
                task.assignedTo.name,
              )}
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

      {/* =========================
          STATUS DROPDOWN
      ========================= */}

      <div className="relative hidden sm:block">
        <button
          type="button"
          disabled={updating}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((value) => !value);
          }}
          className={`
            flex items-center gap-2
            whitespace-nowrap rounded-full
            border px-2.5 py-1
            text-[9px] font-medium
            transition
            hover:brightness-125
            disabled:cursor-not-allowed
            disabled:opacity-60
            ${status.wrapper}
          `}
        >
          {updating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span
              className={`
                h-1.5 w-1.5 rounded-full
                ${status.dot}
              `}
            />
          )}

          {formatStatus(task.status)}

          <ChevronDown className="h-3 w-3 opacity-40" />
        </button>

        {menuOpen && (
          <>
            {/* =========================
                CLOSE MENU BACKDROP
            ========================= */}

            <button
              type="button"
              aria-label="Close status menu"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
              }}
              className="
                fixed inset-0 z-10
                cursor-default
              "
            />

            {/* =========================
                STATUS MENU
            ========================= */}

            <div
              className="
                absolute right-0 top-full z-20
                mt-2 w-40
                overflow-hidden
                rounded-2xl
                border border-white/[0.08]
                bg-[#07100d]/95
                p-1.5
                shadow-[0_20px_60px_rgba(0,0,0,0.55)]
                backdrop-blur-2xl
              "
            >
              <StatusOption
                label="To do"
                status="TODO"
                current={task.status}
                onClick={() =>
                  handleStatusChange('TODO')
                }
              />

              <StatusOption
                label="In progress"
                status="IN_PROGRESS"
                current={task.status}
                onClick={() =>
                  handleStatusChange(
                    'IN_PROGRESS',
                  )
                }
              />

              <StatusOption
                label="Completed"
                status="COMPLETED"
                current={task.status}
                onClick={() =>
                  handleStatusChange(
                    'COMPLETED',
                  )
                }
              />
            </div>
          </>
        )}
      </div>

      {/* =========================
          PRIORITY
      ========================= */}

      <span
        className={`
          hidden whitespace-nowrap
          rounded-full border
          px-2.5 py-1
          text-[9px] font-medium
          md:inline-flex
          ${priority}
        `}
      >
        {task.priority}
      </span>

      {/* =========================
          OPEN TASK DETAILS
      ========================= */}

      <button
        type="button"
        onClick={onClick}
        aria-label="Open task details"
        className="
          flex items-center
        "
      >
        <ArrowRight
          className="
            h-4 w-4
            text-white/15
            transition-all
            group-hover:translate-x-1
            group-hover:text-[#39ff14]/60
          "
        />
      </button>
    </div>
  );
}

/* =========================
   STATUS OPTION
========================= */

function StatusOption({
  label,
  status,
  current,
  onClick,
}: {
  label: string;
  status: Task['status'];
  current: Task['status'];
  onClick: () => void;
}) {
  const style = getStatusStyle(status);

  const active =
    status === current;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`
        flex w-full
        items-center justify-between
        rounded-xl
        px-3 py-2.5
        text-left
        transition
        ${
          active
            ? 'bg-white/[0.05]'
            : 'hover:bg-white/[0.04]'
        }
      `}
    >
      <span className="flex items-center gap-2">
        <span
          className={`
            h-1.5 w-1.5
            rounded-full
            ${style.dot}
          `}
        />

        <span className="text-[10px] text-white/55">
          {label}
        </span>
      </span>

      {active && (
        <Check className="h-3 w-3 text-[#39ff14]" />
      )}
    </button>
  );
}

/* =========================
   STATUS STYLE
========================= */

function getStatusStyle(
  status: Task['status'],
) {
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

/* =========================
   PRIORITY STYLE
========================= */

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

/* =========================
   HELPERS
========================= */

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatStatus(
  status: Task['status'],
) {
  return status
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}
