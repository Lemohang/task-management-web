
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Crown,
  Mail,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  UserX,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

import { getTasks, getUsers, AssignedUser, Task } from '@/lib/api';

type RoleFilter = 'ALL' | 'ADMIN' | 'USER';
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function TeamPage() {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  async function loadTeam(showRefresh = false) {
    const token = localStorage.getItem('accessToken');

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

      setUsers(
        Array.isArray(usersResponse)
          ? usersResponse
          : [],
      );

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

      setTasks(taskList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load the team.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const normalizedRole =
        user.role?.toUpperCase();

      const matchesRole =
        roleFilter === 'ALL' ||
        normalizedRole === roleFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' &&
          user.isActive) ||
        (statusFilter === 'INACTIVE' &&
          !user.isActive);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const teamStats = useMemo(() => {
    const total = users.length;

    const active = users.filter(
      (user) => user.isActive,
    ).length;

    const inactive = total - active;

    const admins = users.filter(
      (user) =>
        user.role?.toUpperCase() === 'ADMIN',
    ).length;

    return {
      total,
      active,
      inactive,
      admins,
    };
  }, [users]);

  function getMemberTasks(userId: number) {
    return tasks.filter(
      (task) => task.assignedTo?.id === userId,
    );
  }

  function getMemberStats(userId: number) {
    const memberTasks = getMemberTasks(userId);

    const completed = memberTasks.filter(
      (task) => task.status === 'COMPLETED',
    ).length;

    const inProgress = memberTasks.filter(
      (task) => task.status === 'IN_PROGRESS',
    ).length;

    const todo = memberTasks.filter(
      (task) => task.status === 'TODO',
    ).length;

    const urgent = memberTasks.filter(
      (task) => task.priority === 'URGENT',
    ).length;

    return {
      total: memberTasks.length,
      completed,
      inProgress,
      todo,
      urgent,
    };
  }

  return (
    <div className="min-h-screen bg-[#020706] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#39ff14]/10 bg-[#39ff14]/[0.07] text-[#39ff14]">
                <Users className="h-4 w-4" />
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#39ff14]/70">
                MPlug Command Center
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Team
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/40">
              Manage your team, monitor workload,
              and see what everyone is working on.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadTeam(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm font-medium text-white/70 transition hover:border-[#39ff14]/20 hover:bg-[#39ff14]/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <TeamStat
            label="Total Members"
            value={teamStats.total}
            icon={Users}
          />

          <TeamStat
            label="Active"
            value={teamStats.active}
            icon={UserCheck}
            accent
          />

          <TeamStat
            label="Inactive"
            value={teamStats.inactive}
            icon={UserX}
          />

          <TeamStat
            label="Administrators"
            value={teamStats.admins}
            icon={Crown}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search team members..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#39ff14]/30 focus:ring-1 focus:ring-[#39ff14]/10"
              />
            </div>

            {/* Role */}
            <FilterSelect
              value={roleFilter}
              onChange={(value) =>
                setRoleFilter(
                  value as RoleFilter,
                )
              }
              options={[
                ['ALL', 'All roles'],
                ['ADMIN', 'Administrators'],
                ['USER', 'Users'],
              ]}
            />

            {/* Status */}
            <FilterSelect
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(
                  value as StatusFilter,
                )
              }
              options={[
                ['ALL', 'All statuses'],
                ['ACTIVE', 'Active'],
                ['INACTIVE', 'Inactive'],
              ]}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => loadTeam()}
          />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              roleFilter !== 'ALL' ||
              statusFilter !== 'ALL'
            }
            onReset={() => {
              setSearch('');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">
                  Team members
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Showing {filteredUsers.length}{' '}
                  of {users.length} members
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-[#39ff14]/10 bg-[#39ff14]/[0.04] px-3 py-1.5 text-[11px] text-[#39ff14]/70 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                Live team data
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => {
                const stats =
                  getMemberStats(user.id);

                return (
                  <TeamMemberCard
                    key={user.id}
                    user={user}
                    stats={stats}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Team Member Card                                                            */
/* -------------------------------------------------------------------------- */

function TeamMemberCard({
  user,
  stats,
}: {
  user: AssignedUser;
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    urgent: number;
  };
}) {
  const initials = user.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const completionRate =
    stats.total > 0
      ? Math.round(
          (stats.completed / stats.total) * 100,
        )
      : 0;

  const workload =
    stats.total === 0
      ? 'Light'
      : stats.total >= 10
        ? 'Heavy'
        : stats.total >= 5
          ? 'Moderate'
          : 'Light';

  const workloadClass =
    workload === 'Heavy'
      ? 'text-red-400 bg-red-400/[0.07] border-red-400/10'
      : workload === 'Moderate'
        ? 'text-amber-400 bg-amber-400/[0.07] border-amber-400/10'
        : 'text-[#39ff14] bg-[#39ff14]/[0.06] border-[#39ff14]/10';

  return (
    <Link
      href={`/dashboard/team/${user.id}`}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#39ff14]/20 hover:bg-white/[0.04]"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#39ff14]/[0.06] blur-3xl transition duration-500 group-hover:bg-[#39ff14]/[0.12]" />

      {/* Profile */}
      <div className="relative flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#39ff14]/10 bg-[#39ff14]/[0.07] text-sm font-semibold text-[#39ff14]">
            {initials}

            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#07100c] ${
                user.isActive
                  ? 'bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.7)]'
                  : 'bg-white/20'
              }`}
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {user.name}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/30">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`ml-3 shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
            user.role?.toUpperCase() ===
            'ADMIN'
              ? 'border-[#39ff14]/10 bg-[#39ff14]/[0.06] text-[#39ff14]'
              : 'border-white/[0.07] bg-white/[0.03] text-white/40'
          }`}
        >
          {user.role}
        </span>
      </div>

      {/* Status */}
      <div className="relative mt-5 flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          {user.isActive ? (
            <>
              <Activity className="h-3.5 w-3.5 text-[#39ff14]" />
              <span className="text-xs text-[#39ff14]/70">
                Active now
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5 text-white/25" />
              <span className="text-xs text-white/30">
                Inactive
              </span>
            </>
          )}
        </div>

        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-medium ${workloadClass}`}
        >
          {workload} workload
        </span>
      </div>

      {/* Task Stats */}
      <div className="relative mt-4 grid grid-cols-4 gap-2">
        <MiniStat
          label="Tasks"
          value={stats.total}
        />

        <MiniStat
          label="Done"
          value={stats.completed}
          positive
        />

        <MiniStat
          label="Active"
          value={stats.inProgress}
        />

        <MiniStat
          label="To Do"
          value={stats.todo}
        />
      </div>

      {/* Completion */}
      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] text-white/30">
            Completion
          </span>

          <span className="text-[11px] font-medium text-white/60">
            {completionRate}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.35)] transition-all"
            style={{
              width: `${completionRate}%`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-white/25">
          {stats.urgent > 0 ? (
            <>
              <Zap className="h-3.5 w-3.5 text-red-400" />
              <span>
                {stats.urgent} urgent{' '}
                {stats.urgent === 1
                  ? 'task'
                  : 'tasks'}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#39ff14]/50" />
              <span>No urgent tasks</span>
            </>
          )}
        </div>

        <span className="text-xs font-medium text-white/30 transition group-hover:text-[#39ff14]">
          View profile →
        </span>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Small Components                                                            */
/* -------------------------------------------------------------------------- */

function TeamStat({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
            accent
              ? 'border-[#39ff14]/10 bg-[#39ff14]/[0.07] text-[#39ff14]'
              : 'border-white/[0.07] bg-white/[0.03] text-white/40'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        {accent && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
        )}
      </div>

      <p className="mt-5 text-xs text-white/30">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-black/15 px-2 py-2.5 text-center">
      <p className="text-[9px] uppercase tracking-wider text-white/20">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          positive
            ? 'text-[#39ff14]'
            : 'text-white/70'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-11 min-w-[150px] rounded-xl border border-white/[0.07] bg-black/20 px-3.5 text-sm text-white/70 outline-none transition focus:border-[#39ff14]/30 focus:ring-1 focus:ring-[#39ff14]/10"
    >
      {options.map(([optionValue, label]) => (
        <option
          key={optionValue}
          value={optionValue}
          className="bg-[#06100d] text-white"
        >
          {label}
        </option>
      ))}
    </select>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="h-[280px] animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025]"
          />
        ),
      )}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.03] p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400">
        <XCircle className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        Unable to load team
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/35">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white/60 transition hover:border-[#39ff14]/20 hover:text-white"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-white/25">
        <Users className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-white">
        {hasFilters
          ? 'No team members found'
          : 'No team members yet'}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">
        {hasFilters
          ? 'Try changing your search or filters.'
          : 'Team members will appear here once they are available.'}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl border border-[#39ff14]/10 bg-[#39ff14]/[0.05] px-4 py-2.5 text-xs font-medium text-[#39ff14] transition hover:bg-[#39ff14]/[0.08]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
