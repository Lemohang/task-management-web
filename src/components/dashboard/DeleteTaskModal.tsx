
'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';

import { deleteTask, Task } from '@/lib/api';

type DeleteTaskModalProps = {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => Promise<void> | void;
};

export default function DeleteTaskModal({
  task,
  open,
  onClose,
  onDeleted,
}: DeleteTaskModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!open || !task) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/';
        return;
      }

      await deleteTask(token, task.id);

      await onDeleted();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete task.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        disabled={deleting}
        aria-label="Close delete confirmation"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07100d]/95 shadow-[0_30px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        {/* Green glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-red-500/[0.08] blur-[80px]" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.07] text-red-300">
                <Trash2 className="h-4 w-4" />
              </div>

              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-red-300/60">
                  Delete task
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white/90">
                  Are you sure?
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-5 rounded-xl border border-red-400/10 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-red-400/[0.08] bg-red-400/[0.025] p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300/70" />

                <div className="min-w-0">
                  <p className="text-xs leading-5 text-white/55">
                    You are about to permanently delete:
                  </p>

                  <p className="mt-2 truncate text-sm font-semibold text-white/80">
                    {task.title}
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-white/25">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-5 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.09] px-5 py-2.5 text-xs font-semibold text-red-300 transition hover:border-red-400/35 hover:bg-red-500/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

