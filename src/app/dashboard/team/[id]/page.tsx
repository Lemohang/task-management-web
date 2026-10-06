
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Target,
  UserCheck,
  UserX,
  Zap,
} from 'lucide-react';

import {
  getTasks,
  getUsers,
  AssignedUser,
  Task,
} from '@/lib/api';

import TaskDetailsModal from '@/components/dashboard/TaskDetailsModal';
import EditTaskModal from '@/components/dashboard/EditTaskModal';
import DeleteTaskModal from '@/components/dashboard/DeleteTaskModal';

export default function TeamMemberPage() {
  const params = useParams();
  const router = useRouter();

  const memberId = Number(params.id);

  const [member, setMember] =
    useState<AssignedUser | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('ALL');
  const [priorityFilter, setPriorityFilter] =
    useState('ALL');

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [editTask, setEditTask] =
    useState<Task | null>(null);

  const [deleteTaskItem, setDeleteTaskItem] =
    useState<Task | null>(null);

  async function loadMember(showRefresh = false) {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      setError('You are not authenticated.');
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const [usersResponse, tasksResponse] =
        await Promise.all([
          getUsers(token),
          getTasks(token, 1, 100),
        ]);

      const users = Array.isArray(usersResponse)
        ? usersResponse
        : [];

      const foundMember = users.find(
        (user) => user.id === memberId,
      );

      if (!foundMember) {
        setError(
          'The requested team member could not be found.',
        );
        setMember(null);
        setTasks([]);
        return;
      }

      setMember(foundMember);

      const responseData =
        tasksResponse as unknown;

      let taskList: Task[] = [];

      if (Array.isArray(responseData)) {
        taskList = responseData;
      } else if (
        responseData &&
        typeof responseData === 'object'
      ) {
        const result = responseData as {
          data?: unknown;
          tasks?: unknown;
        };

        if (Array.isArray(result.data)) {
          taskList = result.data as Task[];
        } else if (
          Array.isArray(result.tasks)
        ) {
          taskList = result.tasks as Task[];
        }
      }

      setTasks(
        taskList.filter(
          (task) =>
            task.assignedTo?.id === memberId,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load team member.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(memberId)) {
      loadMember();
    }
  }, [memberId]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title
          .toLowerCase()
          .includes(query) ||
        task.description
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'ALL' ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

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

    const urgent = tasks.filter(
      (task) => task.priority === 'URGENT',
    ).length;

    const overdue = tasks.filter((task) => {
      if (!task.dueDate) return false;

      if (task.status === 'COMPLETED') {
        return false;
      }

      return (
        new Date(task.dueDate).getTime() <
        new Date().getTime()
      );
    }).length;

    const completionRate =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      urgent,
      overdue,
      completionRate,
    };
  }, [tasks]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-[#020706] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/team"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Link>

          <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.03] p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400">
              <UserX className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-white">
              Unable to load member
            </h2>

            <p className="mt-2 text-xs text-white/35">
              {error || 'Member not found.'}
            </p>

            <button
              type="button"
              onClick={() => loadMember()}
              className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white/60 transition hover:border-[#39ff14]/20 hover:text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = member.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#020706] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/dashboard/team"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>

        {/* Profile Header */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#39ff14]/[0.07] blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#39ff14]/15 bg-[#39ff14]/[0.08] text-2xl font-semibold text-[#39ff14] shadow-[0_0_40px_rgba(57,255,20,0.06)]">
                  {initials}

                  <span
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-[#08100d] ${
                      member.isActive
                        ? 'bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.8)]'
                        : 'bg-white/20'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#39ff14]/10 bg-[#39ff14]/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#39ff14]">
                      {member.role}
                    </span>

                    <span
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${
                        member.isActive
                          ? 'border-[#39ff14]/10 bg-[#39ff14]/[0.05] text-[#39ff14]/70'
                          : 'border-white/[0.07] bg-white/[0.03] text-white/30'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.isActive
                            ? 'bg-[#39ff14]'
                            : 'bg-white/20'
                        }`}
                      />
                      {member.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>

                  <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                    {member.name}
                  </h1>

                  <div className="mt-2 flex items-center gap-2 text-sm text-white/35">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">
                      {member.email}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadMember(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm font-medium text-white/60 transition hover:border-[#39ff14]/20 hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }`}
                />
                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh'}
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <ProfileStat
            label="Assigned"
            value={stats.total}
            icon={Target}
          />

          <ProfileStat
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            accent
          />

          <ProfileStat
            label="In Progress"
            value={stats.inProgress}
            icon={Clock3}
          />

          <ProfileStat
            label="To Do"
            value={stats.todo}
            icon={UserCheck}
          />

          <ProfileStat
            label="Overdue"
            value={stats.overdue}
            icon={Clock3}
            danger={stats.overdue > 0}
          />

          <ProfileStat
            label="Urgent"
            value={stats.urgent}
            icon={Zap}
            danger={stats.urgent > 0}
          />
        </div>

        {/* Completion Overview */}
        <section className="mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/25">
                Performance
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Task completion
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Based on the tasks currently assigned
                to {member.name}.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#39ff14]/10 bg-[#39ff14]/[0.04]">
                <span className="text-sm font-semibold text-[#39ff14]">
                  {stats.completionRate}%
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-white/70">
                  Completion rate
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {stats.completed} of {stats.total}{' '}
                  tasks completed
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.4)] transition-all"
              style={{
                width: `${stats.completionRate}%`,
              }}
            />
          </div>
        </section>

        {/* Task Section */}
        <section>
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/25">
                Workload
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Assigned tasks
              </h2>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tasks..."
                  className="h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#39ff14]/30 sm:w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-white/[0.07] bg-[#06100d] px-3 text-xs text-white/60 outline-none focus:border-[#39ff14]/30"
              >
                <option value="ALL">
                  All statuses
                </option>
                <option value="TODO">
                  To Do
                </option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="COMPLETED">
                  Completed
                </option>
              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-white/[0.07] bg-[#06100d] px-3 text-xs text-white/60 outline-none focus:border-[#39ff14]/30"
              >
                <option value="ALL">
                  All priorities
                </option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">
                  Medium
                </option>
                <option value="HIGH">High</option>
                <option value="URGENT">
                  Urgent
                </option>
              </select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/25">
                <Target className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-white">
                No tasks found
              </h3>

              <p className="mt-2 text-xs text-white/30">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
              <div className="hidden border-b border-white/[0.06] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20 md:grid md:grid-cols-[1fr_140px_120px_110px] md:gap-4">
                <span>Task</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Due</span>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClick={() =>
                      setSelectedTask(task)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
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

      <EditTaskModal
        task={editTask}
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onUpdated={() => {
          setEditTask(null);
          loadMember();
        }}
      />

      <DeleteTaskModal
        task={deleteTaskItem}
        open={!!deleteTaskItem}
        onClose={() =>
          setDeleteTaskItem(null)
        }
        onDeleted={() => {
          setDeleteTaskItem(null);
          loadMember();
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Task Item                                                                   */
/* -------------------------------------------------------------------------- */

function TaskItem({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const isOverdue =
    !!task.dueDate &&
    task.status !== 'COMPLETED' &&
    new Date(task.dueDate).getTime() <
      Date.now();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left transition hover:bg-white/[0.025]"
    >
      <div className="px-5 py-4 md:grid md:grid-cols-[1fr_140px_120px_110px] md:items-center md:gap-4">
        {/* Task */}
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                task.status === 'COMPLETED'
                  ? 'bg-[#39ff14]'
                  : task.status ===
                      'IN_PROGRESS'
                    ? 'bg-blue-400'
                    : 'bg-white/20'
              }`}
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/80 transition group-hover:text-white">
                {task.title}
              </p>

              {task.description && (
                <p className="mt-1 truncate text-xs text-white/25">
                  {task.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile meta */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-5 md:mt-0 md:pl-0">
          <StatusBadge status={task.status} />

          <PriorityBadge
            priority={task.priority}
          />

          <span
            className={`text-xs ${
              isOverdue
                ? 'text-red-400'
                : 'text-white/30'
            }`}
          >
            {formatDate(task.dueDate)}
          </span>
        </div>

        {/* Desktop status */}
        <div className="hidden md:block">
          <StatusBadge status={task.status} />
        </div>

        {/* Desktop priority */}
        <div className="hidden md:block">
          <PriorityBadge
            priority={task.priority}
          />
        </div>

        {/* Desktop due */}
        <div className="hidden md:block">
          <span
            className={`text-xs ${
              isOverdue
                ? 'text-red-400'
                : 'text-white/35'
            }`}
          >
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI Components                                                         */
/* -------------------------------------------------------------------------- */

function ProfileStat({
  label,
  value,
  icon: Icon,
  accent = false,
  danger = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
          danger
            ? 'border-red-400/10 bg-red-400/[0.05] text-red-400'
            : accent
              ? 'border-[#39ff14]/10 bg-[#39ff14]/[0.06] text-[#39ff14]'
              : 'border-white/[0.07] bg-white/[0.03] text-white/40'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-[11px] text-white/25">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-semibold ${
          danger
            ? 'text-red-400'
            : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Task['status'];
}) {
  const styles = {
    TODO: 'border-white/[0.07] bg-white/[0.03] text-white/40',
    IN_PROGRESS:
      'border-blue-400/10 bg-blue-400/[0.06] text-blue-300',
    COMPLETED:
      'border-[#39ff14]/10 bg-[#39ff14]/[0.06] text-[#39ff14]',
  };

  const labels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Task['priority'];
}) {
  const styles = {
    LOW: 'text-white/30',
    MEDIUM: 'text-amber-300',
    HIGH: 'text-orange-400',
    URGENT: 'text-red-400',
  };

  return (
    <span
      className={`text-[10px] font-medium uppercase tracking-wider ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function formatDate(
  date: string | null,
) {
  if (!date) return 'No due date';

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return 'Invalid date';
  }

  return value.toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#020706] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 h-5 w-28 animate-pulse rounded bg-white/[0.05]" />

        <div className="h-40 animate-pulse rounded-3xl border border-white/[0.05] bg-white/[0.025]" />

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025]"
              />
            ),
          )}
        </div>

        <div className="mt-6 h-96 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025]" />
      </div>
    </div>
  );
}
