
'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  UserRound,
  X,
} from 'lucide-react';

import {
  AssignedUser,
  createTask,
  getUsers,
} from '@/lib/api';

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateTaskModal({
  open,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] =
    useState<'TODO' | 'IN_PROGRESS' | 'COMPLETED'>(
      'TODO',
    );
  const [priority, setPriority] =
    useState<
      'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    >('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] =
    useState('');

  useEffect(() => {
    if (!open) return;

    const loadUsers = async () => {
      try {
        const token =
          localStorage.getItem('accessToken');

        if (!token) return;

        setLoadingUsers(true);
        setError('');

        const data = await getUsers(token);

        setUsers(
          data.filter((user) => user.isActive),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load team members.',
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [open]);

  if (!open) return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setPriority('MEDIUM');
    setDueDate('');
    setAssignedToId('');
    setError('');
  };

  const handleClose = () => {
    if (submitting) return;

    resetForm();
    onClose();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/';
        return;
      }

      setSubmitting(true);
      setError('');

      await createTask(token, {
        title: title.trim(),
        description:
          description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        assignedToId: assignedToId
          ? Number(assignedToId)
          : undefined,
      });

      resetForm();
      onClose();
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create task.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#06100d]/95 shadow-[0_30px_120px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#39ff14]/10 blur-[80px]" />

        <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-emerald-500/[0.06] blur-[80px]" />

        <div className="relative border-b border-white/[0.06] px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.8)]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#39ff14]/70">
                  New responsibility
                </span>
              </div>

              <h2 className="text-xl font-semibold tracking-tight text-white/90">
                Create a task
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Add a responsibility and keep your
                workspace moving.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative space-y-5 px-6 py-6 sm:px-7"
        >
          {error && (
            <div className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Task title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Complete landing page"
              autoFocus
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#39ff14]/25 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#39ff14]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What needs to be done?"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#39ff14]/25 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#39ff14]/10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Status"
              value={status}
              onChange={(value) =>
                setStatus(
                  value as
                    | 'TODO'
                    | 'IN_PROGRESS'
                    | 'COMPLETED',
                )
              }
              options={[
                {
                  value: 'TODO',
                  label: 'To do',
                },
                {
                  value: 'IN_PROGRESS',
                  label: 'In progress',
                },
                {
                  value: 'COMPLETED',
                  label: 'Completed',
                },
              ]}
            />

            <SelectField
              label="Priority"
              value={priority}
              onChange={(value) =>
                setPriority(
                  value as
                    | 'LOW'
                    | 'MEDIUM'
                    | 'HIGH'
                    | 'URGENT',
                )
              }
              options={[
                {
                  value: 'LOW',
                  label: 'Low',
                },
                {
                  value: 'MEDIUM',
                  label: 'Medium',
                },
                {
                  value: 'HIGH',
                  label: 'High',
                },
                {
                  value: 'URGENT',
                  label: 'Urgent',
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                Due date
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition focus:border-[#39ff14]/25 focus:bg-white/[0.04] [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                Assign to
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                <select
                  value={assignedToId}
                  onChange={(event) =>
                    setAssignedToId(
                      event.target.value,
                    )
                  }
                  disabled={loadingUsers}
                  className="h-12 w-full appearance-none rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-10 text-sm text-white outline-none transition focus:border-[#39ff14]/25 focus:bg-white/[0.04] disabled:opacity-50"
                >
                  <option
                    value=""
                    className="bg-[#06100d]"
                  >
                    {loadingUsers
                      ? 'Loading team...'
                      : 'Unassigned'}
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                      className="bg-[#06100d]"
                    >
                      {user.name}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="h-11 rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 text-xs font-semibold text-white/45 transition hover:bg-white/[0.05] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.10] px-6 text-xs font-semibold text-[#b9ffad] shadow-[0_0_30px_rgba(57,255,20,0.05)] transition hover:border-[#39ff14]/35 hover:bg-[#39ff14]/[0.15] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-12 w-full appearance-none rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 pr-10 text-sm text-white outline-none transition focus:border-[#39ff14]/25 focus:bg-white/[0.04]"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#06100d]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
      </div>
    </div>
  );
}
