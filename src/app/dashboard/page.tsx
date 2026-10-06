
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';

import {
  getTasks,
  getUsers,
  Task,
  TaskFilters as TaskFilterValues,
  AssignedUser,
} from '@/lib/api';

import CreateTaskModal from '@/components/dashboard/CreateTaskModal';
import TaskDetailsModal from '@/components/dashboard/TaskDetailsModal';
import EditTaskModal from '@/components/dashboard/EditTaskModal';
import DeleteTaskModal from '@/components/dashboard/DeleteTaskModal';
import StatCard from '@/components/dashboard/StatCard';
import TaskRow from '@/components/dashboard/TaskRow';
import TaskFilters from '@/components/dashboard/TaskFilters';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Tasks',
    href: '/dashboard/my-tasks',
    icon: CheckCircle2,
  },
  {
    label: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    label: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
];

export default function DashboardPage() {
  /* =========================
     TASK STATE
  ========================= */

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* =========================
     FILTER STATE
  ========================= */

  const [filters, setFilters] =
    useState<TaskFilterValues>({});

  /* =========================
     UI STATE
  ========================= */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [createModalOpen, setCreateModalOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [editTask, setEditTask] =
    useState<Task | null>(null);

  const [deleteTaskItem, setDeleteTaskItem] =
    useState<Task | null>(null);

  const pathname = usePathname();

  /* =========================
     LOAD TASKS
  ========================= */

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await getTasks(
        token,
        1,
        10,
        filters,
      );

      setTasks(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /* =========================
     LOAD USERS
  ========================= */

  const loadUsers = useCallback(async () => {
    try {
      const token =
        localStorage.getItem('accessToken');

      if (!token) return;

      const data = await getUsers(token);

      setUsers(data);
    } catch {
      // User filtering is optional.
      // Do not break the dashboard if it fails.
    }
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* =========================
     LOAD WHEN FILTERS CHANGE
  ========================= */

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* =========================
     STATISTICS
  ========================= */

  const statistics = useMemo(
    () => ({
      total: tasks.length,

      todo: tasks.filter(
        (task) => task.status === 'TODO',
      ).length,

      inProgress: tasks.filter(
        (task) =>
          task.status === 'IN_PROGRESS',
      ).length,

      completed: tasks.filter(
        (task) =>
          task.status === 'COMPLETED',
      ).length,
    }),
    [tasks],
  );

  /* =========================
     SEARCH VALUE
  ========================= */

  const searchValue =
    filters.search ?? '';

  /* =========================
     RESET FILTERS
  ========================= */

  const resetFilters = () => {
    setFilters({});
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem(
      'accessToken',
    );

    window.location.href = '/';
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#010705] text-white">
      <Background />

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/[0.06] bg-[#020908]/95 px-5 py-6 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Brand */}

        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="relative flex h-11 w-11 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-[#39ff14]/20 blur-xl" />

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#39ff14]/20 bg-white/[0.04]">
              <img
                src="/mpuglogo.png"
                alt="MPlug"
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>

          <div>
            <strong className="block text-sm font-bold tracking-[0.18em]">
              MPLUG
            </strong>

            <span className="mt-0.5 block text-[9px] font-medium tracking-[0.25em] text-white/35">
              TASK MANAGEMENT
            </span>
          </div>
        </div>

        {/* Workspace */}

        <div className="mb-3 px-3 text-[9px] font-semibold tracking-[0.22em] text-white/25">
          WORKSPACE
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all ${
                  active
                    ? 'border border-[#39ff14]/10 bg-[#39ff14]/[0.08] text-white'
                    : 'text-white/45 hover:bg-white/[0.035] hover:text-white'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    active
                      ? 'bg-[#39ff14]/10 text-[#39ff14]'
                      : 'text-white/40 group-hover:text-white/70'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="font-medium">
                  {item.label}
                </span>

                {active && (
                  <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.9)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System */}

        <div className="mb-3 mt-9 px-3 text-[9px] font-semibold tracking-[0.22em] text-white/25">
          SYSTEM
        </div>

        {/* SETTINGS — NOW WORKING */}

        <Link
          href="/dashboard/settings"
          onClick={() =>
            setSidebarOpen(false)
          }
          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all ${
            pathname === '/dashboard/settings'
              ? 'border border-[#39ff14]/10 bg-[#39ff14]/[0.08] text-white'
              : 'text-white/45 hover:bg-white/[0.035] hover:text-white'
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              pathname === '/dashboard/settings'
                ? 'bg-[#39ff14]/10 text-[#39ff14]'
                : 'text-white/40 group-hover:text-white/70'
            }`}
          >
            <Settings className="h-4 w-4" />
          </span>

          <span className="font-medium">
            Settings
          </span>

          {pathname === '/dashboard/settings' && (
            <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.9)]" />
          )}
        </Link>

        {/* Bottom */}

        <div className="mt-auto border-t border-white/[0.06] pt-5">
          <div className="mb-3 flex items-center gap-3 px-2">
            <Avatar />

            <div className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-semibold text-white/80">
                MPlug Admin
              </strong>

              <span className="text-[10px] text-white/30">
                Workspace
              </span>
            </div>

            <MoreHorizontal className="h-4 w-4 text-white/25" />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/35 transition hover:bg-red-500/[0.06] hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />

            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <section className="relative min-h-screen lg:pl-[270px]">
        {/* TOP BAR */}

        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-4 border-b border-white/[0.05] bg-[#010705]/75 px-5 backdrop-blur-2xl sm:px-8 lg:px-10">
          {/* Mobile menu */}

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/60 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}

          <div className="relative flex h-11 max-w-[520px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              type="text"
              placeholder="Search tasks, people, projects..."
              value={searchValue}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search:
                    event.target.value ||
                    undefined,
                }))
              }
              className="h-full w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-16 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#39ff14]/20 focus:bg-white/[0.035]"
            />

            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[10px] text-white/25 sm:block">
              ⌘ K
            </span>
          </div>

          {/* User */}

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.04] hover:text-white"
            >
              <Bell className="h-4 w-4" />

              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.9)]" />
            </button>

            <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />

            <div className="hidden items-center gap-3 sm:flex">
              <Avatar />

              <div className="hidden md:block">
                <strong className="block text-xs font-semibold text-white/75">
                  MPlug Admin
                </strong>

                <span className="text-[10px] text-white/30">
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* Welcome */}

          <section className="mb-9 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#39ff14]/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />

                MPlug Workspace
              </div>

              <h1 className="max-w-[700px] text-3xl font-semibold leading-[1.15] tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
                Good morning,
                <br />

                <span className="bg-gradient-to-r from-white via-white to-[#39ff14] bg-clip-text text-transparent">
                  let's get things moving.
                </span>
              </h1>

              <p className="mt-4 max-w-[600px] text-sm leading-6 text-white/35 sm:text-[15px]">
                Stay focused, keep the team aligned,
                and turn today's responsibilities into
                meaningful progress.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setCreateModalOpen(true)
              }
              className="flex w-fit items-center gap-2.5 rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.09] px-5 py-3 text-sm font-semibold text-[#b9ffad] shadow-[0_0_30px_rgba(57,255,20,0.06)] transition hover:border-[#39ff14]/40 hover:bg-[#39ff14]/[0.14]"
            >
              <Plus className="h-4 w-4" />

              Create task
            </button>
          </section>

          {/* Error */}

          {error && (
            <div className="mb-6 flex items-start gap-4 rounded-2xl border border-red-400/10 bg-red-500/[0.05] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <strong className="text-sm text-red-200">
                  Something went wrong
                </strong>

                <p className="mt-1 text-xs leading-5 text-red-200/50">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Statistics */}

          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total tasks"
              value={statistics.total}
              icon={
                <CheckCircle2 className="h-4 w-4" />
              }
              accent="green"
              description="Across your workspace"
            />

            <StatCard
              label="To do"
              value={statistics.todo}
              icon={
                <Circle className="h-4 w-4" />
              }
              accent="blue"
              description="Waiting to be started"
            />

            <StatCard
              label="In progress"
              value={statistics.inProgress}
              icon={
                <Circle className="h-4 w-4" />
              }
              accent="orange"
              description="Currently being worked on"
            />

            <StatCard
              label="Completed"
              value={statistics.completed}
              icon={
                <Check className="h-4 w-4" />
              }
              accent="purple"
              description="Successfully finished"
            />
          </section>

          {/* RECENT TASKS */}

          <section className="mb-7 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.018] shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="border-b border-white/[0.05] px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-white/90">
                      Recent tasks
                    </h2>

                    <span className="rounded-full border border-white/[0.06] bg-white/[0.035] px-2 py-0.5 text-[10px] font-medium text-white/35">
                      {tasks.length}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-white/30">
                    Keep an eye on what's happening
                    across the workspace.
                  </p>
                </div>

                <Link
                  href="/dashboard/my-tasks"
                  className="group flex items-center gap-2 text-xs font-medium text-white/35 transition hover:text-[#39ff14]"
                >
                  View all

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* FILTERS */}

              <div className="mt-5">
                <TaskFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={resetFilters}
                  users={users}
                />
              </div>
            </div>

            {/* TASK CONTENT */}

            {loading ? (
              <Loading />
            ) : tasks.length === 0 ? (
              <EmptyState
                search={searchValue}
                hasFilters={hasActiveFilters(
                  filters,
                )}
              />
            ) : (
              <div className="divide-y divide-white/[0.045]">
                {tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={() =>
                      setSelectedTask(task)
                    }
                    onUpdated={loadTasks}
                  />
                ))}
              </div>
            )}
          </section>

          {/* BOTTOM */}

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
            {/* Workflow */}

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-white/[0.012] p-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#39ff14]/10 blur-[70px]" />

              <div className="relative flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-semibold tracking-[0.22em] text-[#39ff14]/60">
                    WORKFLOW
                  </span>

                  <h3 className="mt-2 text-xl font-semibold leading-tight text-white/90">
                    Your workspace
                    <br />

                    <span className="text-white/45">
                      at a glance
                    </span>
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#39ff14]/10 bg-[#39ff14]/[0.06] text-[#39ff14]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-9">
                <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.04]">
                  <span
                    className="bg-[#38bdf8]"
                    style={{
                      width: `${percentage(
                        statistics.todo,
                        statistics.total,
                      )}%`,
                    }}
                  />

                  <span
                    className="bg-[#f59e0b]"
                    style={{
                      width: `${percentage(
                        statistics.inProgress,
                        statistics.total,
                      )}%`,
                    }}
                  />

                  <span
                    className="bg-[#a855f7]"
                    style={{
                      width: `${percentage(
                        statistics.completed,
                        statistics.total,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                  <Legend
                    color="bg-[#38bdf8]"
                    label="To do"
                  />

                  <Legend
                    color="bg-[#f59e0b]"
                    label="In progress"
                  />

                  <Legend
                    color="bg-[#a855f7]"
                    label="Completed"
                  />
                </div>
              </div>
            </div>

            {/* Quick action */}

            <div className="group relative overflow-hidden rounded-2xl border border-[#39ff14]/10 bg-[#39ff14]/[0.035] p-6 transition hover:border-[#39ff14]/20 hover:bg-[#39ff14]/[0.05]">
              <div className="absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-[#39ff14]/10 blur-[70px]" />

              <div className="relative flex h-full flex-col">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-[#39ff14]/15 bg-[#39ff14]/[0.08] text-[#39ff14]">
                  <Plus className="h-5 w-5" />
                </div>

                <span className="text-[9px] font-semibold tracking-[0.2em] text-[#39ff14]/55">
                  QUICK ACTION
                </span>

                <h3 className="mt-2 text-lg font-semibold text-white/85">
                  Create a new task
                </h3>

                <p className="mt-2 max-w-[340px] text-xs leading-5 text-white/30">
                  Turn an idea into an actionable
                  responsibility for your team.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setCreateModalOpen(true)
                  }
                  className="mt-auto flex h-10 w-10 items-center justify-center self-end rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/40 transition hover:border-[#39ff14]/20 hover:bg-[#39ff14]/10 hover:text-[#39ff14]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* CREATE */}

      <CreateTaskModal
        open={createModalOpen}
        onClose={() =>
          setCreateModalOpen(false)
        }
        onCreated={loadTasks}
      />

      {/* DETAILS */}

      <TaskDetailsModal
        task={selectedTask}
        open={selectedTask !== null}
        onClose={() =>
          setSelectedTask(null)
        }
        onEdit={() => {
          setEditTask(selectedTask);
          setSelectedTask(null);
        }}
        onDelete={() => {
          setDeleteTaskItem(selectedTask);
          setSelectedTask(null);
        }}
      />

      {/* DELETE */}

      <DeleteTaskModal
        task={deleteTaskItem}
        open={!!deleteTaskItem}
        onClose={() =>
          setDeleteTaskItem(null)
        }
        onDeleted={() => {
          setDeleteTaskItem(null);
          loadTasks();
        }}
      />

      {/* EDIT */}

      <EditTaskModal
        task={editTask}
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onUpdated={() => {
          setEditTask(null);
          loadTasks();
        }}
      />
    </main>
  );
}

/* ==========================================================================
   BACKGROUND
========================================================================== */

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#064e3b]/20 blur-[120px]" />

      <div className="absolute right-[-180px] top-[15%] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.08] blur-[140px]" />

      <div className="absolute bottom-[-220px] left-[30%] h-[500px] w-[500px] rounded-full bg-[#064e3b]/20 blur-[140px]" />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(57,255,20,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.35) 1px, transparent 1px)',
          backgroundSize: '55px 55px',
        }}
      />
    </div>
  );
}

/* ==========================================================================
   AVATAR
========================================================================== */

function Avatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#39ff14]/20 bg-[#39ff14]/10 text-[10px] font-bold text-[#39ff14]">
      MP
    </div>
  );
}

/* ==========================================================================
   LOADING
========================================================================== */

function Loading() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-[#39ff14]" />

      <span className="text-xs text-white/30">
        Loading workspace...
      </span>
    </div>
  );
}

/* ==========================================================================
   EMPTY STATE
========================================================================== */

function EmptyState({
  search,
  hasFilters,
}: {
  search: string;
  hasFilters: boolean;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-white/25">
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-semibold text-white/70">
        No tasks found
      </h3>

      <p className="mt-1.5 text-xs text-white/30">
        {search
          ? 'Try adjusting your search.'
          : hasFilters
            ? 'Try changing or clearing your filters.'
            : 'Your workspace is ready for its first task.'}
      </p>
    </div>
  );
}

/* ==========================================================================
   LEGEND
========================================================================== */

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 text-[10px] text-white/35">
      <i
        className={`h-2 w-2 rounded-full ${color}`}
      />

      {label}
    </span>
  );
}

/* ==========================================================================
   ACTIVE FILTER CHECK
========================================================================== */

function hasActiveFilters(
  filters: TaskFilterValues,
) {
  return Boolean(
    filters.search ||
      filters.status ||
      filters.priority ||
      filters.due ||
      filters.assignedTo,
  );
}

/* ==========================================================================
   PERCENTAGE
========================================================================== */

function percentage(
  value: number,
  total: number,
) {
  if (!total) return 0;

  return (value / total) * 100;
}
