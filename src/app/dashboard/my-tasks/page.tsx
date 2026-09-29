
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Search,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import {
  getMyTasks,
  Task,
  TaskFilters as TaskFilterValues,
} from '@/lib/api';

import TaskRow from '@/components/dashboard/TaskRow';
import TaskDetailsModal from '@/components/dashboard/TaskDetailsModal';
import EditTaskModal from '@/components/dashboard/EditTaskModal';
import DeleteTaskModal from '@/components/dashboard/DeleteTaskModal';
import TaskFilters from '@/components/dashboard/TaskFilters';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] =
    useState<TaskFilterValues>({});

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [editTask, setEditTask] =
    useState<Task | null>(null);

  const [deleteTaskItem, setDeleteTaskItem] =
    useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    if (!token) {
      setError('You are not authenticated.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await getMyTasks(
        token,
        1,
        50,
        filters,
      );

      setTasks(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load your tasks.',
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const stats = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.status === 'COMPLETED',
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === 'IN_PROGRESS',
    ).length;

    const todo = tasks.filter(
      (task) => task.status === 'TODO',
    ).length;

    const overdue = tasks.filter((task) => {
      if (!task.dueDate || task.status === 'COMPLETED') {
        return false;
      }

      return new Date(task.dueDate) < new Date();
    }).length;

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
    };
  }, [tasks]);

  const resetFilters = () => {
    setFilters({});
  };

  const hasActiveFilters =
    Object.values(filters).some(
      (value) =>
        value !== undefined &&
        value !== '',
    );

  return (
    <main className="min-h-screen bg-[#020706] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-green-400/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                <ListTodo
                  size={24}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  My Tasks
                </h1>

                <p className="mt-1 text-sm text-white/45">
                  Manage and track the tasks assigned to you.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50 sm:flex">
            <Sparkles
              size={15}
              className="text-emerald-400"
            />
            Personal workspace
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat
            label="Total"
            value={stats.total}
            icon={<ListTodo size={17} />}
          />

          <Stat
            label="To Do"
            value={stats.todo}
            icon={<Circle size={17} />}
          />

          <Stat
            label="In Progress"
            value={stats.inProgress}
            icon={<Clock3 size={17} />}
          />

          <Stat
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={17} />}
          />

          <Stat
            label="Overdue"
            value={stats.overdue}
            icon={<Clock3 size={17} />}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TaskFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Content */}
        <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-2xl shadow-black/20 backdrop-blur-xl">

          {/* Section header */}
          <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold">
                Your Tasks
              </h2>

              <p className="mt-1 text-xs text-white/40">
                {tasks.length}{' '}
                {tasks.length === 1
                  ? 'task'
                  : 'tasks'}{' '}
                displayed
              </p>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-left text-xs text-emerald-400 transition hover:text-emerald-300 sm:text-right"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-white/[0.04]"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                !
              </div>

              <h3 className="font-medium">
                Something went wrong
              </h3>

              <p className="mt-2 max-w-md text-sm text-white/40">
                {error}
              </p>

              <button
                onClick={loadTasks}
                className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-400 transition hover:bg-emerald-400/15"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && tasks.length === 0 && (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/5">
                <Search
                  size={26}
                  className="text-emerald-400/70"
                />
              </div>

              <h3 className="text-lg font-medium">
                {hasActiveFilters
                  ? 'No matching tasks'
                  : 'No tasks assigned to you'}
              </h3>

              <p className="mt-2 max-w-md text-sm text-white/40">
                {hasActiveFilters
                  ? 'Try changing your filters or clearing them.'
                  : 'Tasks assigned to you will appear here.'}
              </p>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Tasks */}
          {!loading && !error && tasks.length > 0 && (
            <div className="divide-y divide-white/[0.05]">
              {tasks.map((task) => (
                <TaskRow
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                    onUpdated={loadTasks}
                    />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Details Modal */}
      ```tsx
{/* Task Details Modal */}
<TaskDetailsModal
  task={selectedTask}
  open={!!selectedTask}
  onClose={() => setSelectedTask(null)}
  onEdit={() => {
    if (!selectedTask) return;

    setEditTask(selectedTask);
    setSelectedTask(null);
  }}
  onDelete={() => {
    if (!selectedTask) return;

    setDeleteTaskItem(selectedTask);
    setSelectedTask(null);
  }}
/>

{/* Edit Task Modal */}
<EditTaskModal
  task={editTask}
  open={!!editTask}
  onClose={() => setEditTask(null)}
  onUpdated={() => {
    setEditTask(null);
    loadTasks();
  }}
/>

{/* Delete Task Modal */}
<DeleteTaskModal
  task={deleteTaskItem}
  open={!!deleteTaskItem}
  onClose={() => setDeleteTaskItem(null)}
  onDeleted={() => {
    setDeleteTaskItem(null);
    loadTasks();
  }}
/>

    </main>
  );
}

/* =========================
   STAT
========================= */

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-white/40">
        {icon}
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

