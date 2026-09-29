
'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  Loader2,
  Save,
  User,
  X,
} from 'lucide-react';

import {
  getUsers,
  Task,
  updateTask,
  AssignedUser,
} from '@/lib/api';

type EditTaskModalProps = {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => Promise<void> | void;
};

export default function EditTaskModal({
  task,
  open,
  onClose,
  onUpdated,
}: EditTaskModalProps) {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] =
    useState<Task['status']>('TODO');
  const [priority, setPriority] =
    useState<Task['priority']>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] =
    useState('');

  useEffect(() => {
    if (!open || !task) return;

    setTitle(task.title);
    setDescription(task.description ?? '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(toInputDate(task.dueDate));
    setAssignedToId(
      task.assignedTo
        ? String(task.assignedTo.id)
        : '',
    );

    setError('');
  }, [open, task]);

  useEffect(() => {
    if (!open) return;

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);

        const token =
          localStorage.getItem('accessToken');

        if (!token) return;

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

  if (!open || !task) return null;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/';
        return;
      }

      await updateTask(token, task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        assignedToId: assignedToId
          ? Number(assignedToId)
          : undefined,
      });

      await onUpdated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update task.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close edit task"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07100d]/95 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#39ff14]/10 blur-[100px]" />

        <form
          onSubmit={handleSubmit}
          className="relative"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5 sm:px-7">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.9)]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#39ff14]/65">
                  Edit task
                </span>
              </div>

              <h2 className="text-xl font-semibold text-white/90">
                Update task
              </h2>

              <p className="mt-1 text-xs text-white/25">
                Make changes to this task and save them.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[68vh] overflow-y-auto px-6 py-6 sm:px-7">
            {error && (
              <div className="mb-5 rounded-xl border border-red-400/10 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Title */}
            <Field label="Task title">
              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter task title"
                className="input"
                autoFocus
              />
            </Field>

            {/* Description */}
            <Field
              label="Description"
              className="mt-5"
            >
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the task..."
                rows={4}
                className="input resize-none"
              />
            </Field>

            {/* Status + Priority */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Status">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as Task['status'],
                    )
                  }
                  className="input appearance-none"
                >
                  <option value="TODO">
                    To do
                  </option>

                  <option value="IN_PROGRESS">
                    In progress
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>
                </select>
              </Field>

              <Field label="Priority">
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as Task['priority'],
                    )
                  }
                  className="input appearance-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">
                    Medium
                  </option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">
                    Urgent
                  </option>
                </select>
              </Field>
            </div>

            {/* Due date + Assignee */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Due date">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                    className="input pl-10"
                  />
                </div>
              </Field>

              <Field label="Assign to">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                  <select
                    value={assignedToId}
                    onChange={(event) =>
                      setAssignedToId(
                        event.target.value,
                      )
                    }
                    disabled={loadingUsers}
                    className="input appearance-none pl-10"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingUsers && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-white/25">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading team members...
                  </div>
                )}
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.09] px-5 py-2.5 text-xs font-semibold text-[#b9ffad] transition hover:border-[#39ff14]/40 hover:bg-[#39ff14]/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable field                                                             */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
        {label}
      </label>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function toInputDate(
  date: string | null,
) {
  if (!date) return '';

  return new Date(date)
    .toISOString()
    .split('T')[0];
}

