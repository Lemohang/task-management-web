
'use client';

import Image from 'next/image';
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
  CheckCheck,
  CheckCircle2,
  Circle,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
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

type WorkspaceSettings = {
  notifications: boolean;
  emailNotifications: boolean;
  compactMode: boolean;
};

type CurrentUser = {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
};

const DEFAULT_SETTINGS: WorkspaceSettings = {
  notifications: true,
  emailNotifications: false,
  compactMode: false,
};

type DashboardNotification = {
  id: string;
  type: 'overdue' | 'urgent';
  title: string;
  message: string;
  taskId: number | string;
};

export default function DashboardPage() {
  /* =========================
     CURRENT LOGGED-IN USER
  ========================= */

  const [currentUser, setCurrentUser] =
    useState<CurrentUser>({});

  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const storedUser =
          localStorage.getItem('user');

        if (!storedUser) {
          setCurrentUser({});
          return;
        }

        const parsed: unknown =
          JSON.parse(storedUser);

        if (
          !parsed ||
          typeof parsed !== 'object'
        ) {
          setCurrentUser({});
          return;
        }

        const record =
          parsed as Record<string, unknown>;

        // Support both { name, email, role }
        // and { user: { name, email, role } }.
        const nestedUser =
          record.user &&
          typeof record.user === 'object'
            ? record.user as Record<string, unknown>
            : record;

        const name =
          typeof nestedUser.name === 'string'
            ? nestedUser.name
            : '';

        const email =
          typeof nestedUser.email === 'string'
            ? nestedUser.email
            : '';

        const role =
          typeof nestedUser.role === 'string'
            ? nestedUser.role
            : '';

        const idValue =
          nestedUser.id;

        const id =
          typeof idValue === 'number' ||
          typeof idValue === 'string'
            ? idValue
            : undefined;

        setCurrentUser({
          id,
          name,
          email,
          role,
          isActive:
            typeof nestedUser.isActive === 'boolean'
              ? nestedUser.isActive
              : true,
        });
      } catch {
        setCurrentUser({});
      }
    };

    loadCurrentUser();

    // Refresh the profile if another tab changes it.
    window.addEventListener(
      'storage',
      loadCurrentUser,
    );

    // Refresh when the Settings page updates the profile.
    window.addEventListener(
      'profileChanged',
      loadCurrentUser,
    );

    return () => {
      window.removeEventListener(
        'storage',
        loadCurrentUser,
      );

      window.removeEventListener(
        'profileChanged',
        loadCurrentUser,
      );
    };
  }, []);

  const displayName =
    currentUser.name?.trim() ||
    currentUser.email?.split('@')[0] ||
    'User';

  const normalizedRole =
    currentUser.role?.trim().toUpperCase();

  const displayRole =
    normalizedRole === 'ADMIN'
      ? 'Administrator'
      : normalizedRole === 'USER'
        ? 'Team member'
        : currentUser.role?.trim() ||
          'Team member';

  const avatarInitials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

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

  const [compactMode, setCompactMode] =
    useState(false);

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(DEFAULT_SETTINGS.notifications);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [readNotificationIds, setReadNotificationIds] =
    useState<string[]>([]);

  const [
    dismissedNotificationIds,
    setDismissedNotificationIds,
  ] = useState<string[]>([]);

  const [greeting, setGreeting] =
    useState('Good morning');

  const [currentTime, setCurrentTime] =
    useState(0);

  const pathname = usePathname();

  /* =========================
     LOAD SETTINGS
  ========================= */

  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored =
          localStorage.getItem('settings');

        if (!stored) {
          setCompactMode(
            DEFAULT_SETTINGS.compactMode,
          );

          setNotificationsEnabled(
            DEFAULT_SETTINGS.notifications,
          );

          return;
        }

        const parsed =
          JSON.parse(stored) as Partial<WorkspaceSettings>;

        setCompactMode(
          parsed.compactMode ??
            DEFAULT_SETTINGS.compactMode,
        );

        setNotificationsEnabled(
          parsed.notifications ??
            DEFAULT_SETTINGS.notifications,
        );
      } catch {
        setCompactMode(
          DEFAULT_SETTINGS.compactMode,
        );

        setNotificationsEnabled(
          DEFAULT_SETTINGS.notifications,
        );
      }
    };

    loadSettings();

    const handleStorageChange = () => {
      loadSettings();
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'settingsChanged',
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'settingsChanged',
        handleStorageChange,
      );
    };
  }, []);

  /* =========================
     LOAD NOTIFICATION STATE
  ========================= */

  useEffect(() => {
    try {
      const storedRead =
        localStorage.getItem('notificationRead');

      if (storedRead) {
        const parsed = JSON.parse(storedRead);

        if (Array.isArray(parsed)) {
          setReadNotificationIds(
            parsed.filter(
              (item): item is string =>
                typeof item === 'string',
            ),
          );
        }
      }

      const storedDismissed =
        localStorage.getItem('notificationDismissed');

      if (storedDismissed) {
        const parsed = JSON.parse(storedDismissed);

        if (Array.isArray(parsed)) {
          setDismissedNotificationIds(
            parsed.filter(
              (item): item is string =>
                typeof item === 'string',
            ),
          );
        }
      }
    } catch {
      setReadNotificationIds([]);
      setDismissedNotificationIds([]);
    }
  }, []);

  /* =========================
     TIME-BASED GREETING
  ========================= */

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      setCurrentTime(now.getTime());

      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning');
      } else if (hour >= 12 && hour < 18) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };

    updateTime();

    const interval = window.setInterval(
      updateTime,
      60 * 1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

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
     NOTIFICATIONS
  ========================= */

  const notifications = useMemo<
    DashboardNotification[]
  >(() => {
    if (!notificationsEnabled || !currentTime) {
      return [];
    }

    const now = new Date(currentTime);

    const generated: DashboardNotification[] = [];

    tasks.forEach((task) => {
      const taskStatus =
        String(task.status).toUpperCase();

      const taskPriority =
        String(task.priority).toUpperCase();

      if (
        task.dueDate &&
        taskStatus !== 'COMPLETED'
      ) {
        const dueDate = new Date(task.dueDate);

        if (
          !Number.isNaN(dueDate.getTime()) &&
          dueDate.getTime() < now.getTime()
        ) {
          generated.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            title: 'Task overdue',
            message: `"${task.title}" is past its due date.`,
            taskId: task.id,
          });
        }
      }

      if (
        taskPriority === 'URGENT' &&
        taskStatus !== 'COMPLETED'
      ) {
        generated.push({
          id: `urgent-${task.id}`,
          type: 'urgent',
          title: 'Urgent task',
          message: `"${task.title}" needs your attention.`,
          taskId: task.id,
        });
      }
    });

    return generated
      .filter(
        (notification) =>
          !dismissedNotificationIds.includes(
            notification.id,
          ),
      )
      .slice(0, 8);
  }, [
    tasks,
    notificationsEnabled,
    dismissedNotificationIds,
    currentTime,
  ]);

  const unreadNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !readNotificationIds.includes(
            notification.id,
          ),
      ),
    [notifications, readNotificationIds],
  );

  const unreadCount = unreadNotifications.length;

  /* =========================
     MARK ONE NOTIFICATION READ
  ========================= */

  const markNotificationRead = (
    notificationId: string,
  ) => {
    setReadNotificationIds((current) => {
      if (current.includes(notificationId)) {
        return current;
      }

      const next = [...current, notificationId];

      localStorage.setItem(
        'notificationRead',
        JSON.stringify(next),
      );

      return next;
    });
  };

  /* =========================
     MARK ALL READ
  ========================= */

  const markAllNotificationsRead = () => {
    const ids = notifications.map(
      (notification) => notification.id,
    );

    const next = Array.from(
      new Set([...readNotificationIds, ...ids]),
    );

    setReadNotificationIds(next);

    localStorage.setItem(
      'notificationRead',
      JSON.stringify(next),
    );
  };

  /* =========================
     CLEAR NOTIFICATIONS
  ========================= */

  const clearNotifications = () => {
    const ids = notifications.map(
      (notification) => notification.id,
    );

    const next = Array.from(
      new Set([
        ...dismissedNotificationIds,
        ...ids,
      ]),
    );

    setDismissedNotificationIds(next);

    localStorage.setItem(
      'notificationDismissed',
      JSON.stringify(next),
    );

    setNotificationsOpen(false);
  };

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
        (task) => task.status === 'IN_PROGRESS',
      ).length,

      completed: tasks.filter(
        (task) => task.status === 'COMPLETED',
      ).length,
    }),
    [tasks],
  );

  /* =========================
     SEARCH VALUE
  ========================= */

  const searchValue = filters.search ?? '';

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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    window.location.href = '/';
  };

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[#010705] text-white ${
        compactMode ? 'compact-mode' : ''
      }`}
    >
      <Background />

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/[0.06] bg-[#020908]/95 px-5 py-6 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}

        <div
          className={`flex items-center gap-3 px-2 transition-all ${
            compactMode ? 'mb-6' : 'mb-10'
          }`}
        >
          <div className="relative flex h-11 w-11 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-[#39ff14]/20 blur-xl" />

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#39ff14]/20 bg-white/[0.04]">
              <Image
                src="/mpuglogo.png"
                width={32}
                height={32}
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

        <div
          className={`px-3 text-[9px] font-semibold tracking-[0.22em] text-white/25 ${
            compactMode ? 'mb-2' : 'mb-3'
          }`}
        >
          WORKSPACE
        </div>

        <nav
          className={compactMode ? 'space-y-0.5' : 'space-y-1'}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-all ${
                  compactMode ? 'py-2' : 'py-3'
                } ${
                  active
                    ? 'border border-[#39ff14]/10 bg-[#39ff14]/[0.08] text-white'
                    : 'text-white/45 hover:bg-white/[0.035] hover:text-white'
                }`}
              >
                <span
                  className={`flex items-center justify-center rounded-lg ${
                    compactMode ? 'h-8 w-8' : 'h-9 w-9'
                  } ${
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

        <div
          className={`px-3 text-[9px] font-semibold tracking-[0.22em] text-white/25 ${
            compactMode ? 'mb-2 mt-6' : 'mb-3 mt-9'
          }`}
        >
          SYSTEM
        </div>

        {/* SETTINGS */}

        <Link
          href="/dashboard/settings"
          onClick={() => setSidebarOpen(false)}
          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-all ${
            compactMode ? 'py-2' : 'py-3'
          } ${
            pathname === '/dashboard/settings'
              ? 'border border-[#39ff14]/10 bg-[#39ff14]/[0.08] text-white'
              : 'text-white/45 hover:bg-white/[0.035] hover:text-white'
          }`}
        >
          <span
            className={`flex items-center justify-center rounded-lg ${
              compactMode ? 'h-8 w-8' : 'h-9 w-9'
            } ${
              pathname === '/dashboard/settings'
                ? 'bg-[#39ff14]/10 text-[#39ff14]'
                : 'text-white/40 group-hover:text-white/70'
            }`}
          >
            <Settings className="h-4 w-4" />
          </span>

          <span className="font-medium">Settings</span>

          {pathname === '/dashboard/settings' && (
            <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.9)]" />
          )}
        </Link>

        {/* Bottom user profile */}

        <div className="mt-auto border-t border-white/[0.06] pt-5">
          <div className="mb-3 flex items-center gap-3 px-2">
            <Avatar initials={avatarInitials} />

            <div className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-semibold text-white/80">
                {displayName}
              </strong>

              <span className="block truncate text-[10px] text-white/30">
                {displayRole}
              </span>
            </div>

            <MoreHorizontal className="h-4 w-4 shrink-0 text-white/25" />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 text-sm text-white/35 transition hover:bg-red-500/[0.06] hover:text-red-300 ${
              compactMode ? 'py-2' : 'py-3'
            }`}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <section className="relative min-h-screen lg:pl-[270px]">
        {/* TOP BAR */}

        <header
          className={`sticky top-0 z-30 flex items-center gap-4 border-b border-white/[0.05] bg-[#010705]/75 px-5 backdrop-blur-2xl transition-all sm:px-8 lg:px-10 ${
            compactMode ? 'h-[62px]' : 'h-[76px]'
          }`}
        >
          {/* Mobile menu */}

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/60 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}

          <div
            className={`relative flex max-w-[520px] flex-1 transition-all ${
              compactMode ? 'h-9' : 'h-11'
            }`}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              type="text"
              placeholder="Search tasks, people, projects..."
              value={searchValue}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  search: event.target.value || undefined,
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
            {/* NOTIFICATION BELL */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen((current) => !current)
                }
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  notificationsOpen
                    ? 'bg-[#39ff14]/10 text-[#39ff14]'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Bell className="h-4 w-4" />

                {notificationsEnabled && unreadCount > 0 && (
                  <>
                    <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.9)]" />

                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#010705] bg-[#39ff14] px-1 text-[9px] font-bold text-black shadow-[0_0_12px_rgba(57,255,20,0.35)]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {/* NOTIFICATION PANEL */}

              {notificationsOpen && (
                <NotificationPanel
                  enabled={notificationsEnabled}
                  notifications={notifications}
                  unreadCount={unreadCount}
                  readNotificationIds={readNotificationIds}
                  onClose={() => setNotificationsOpen(false)}
                  onMarkRead={markNotificationRead}
                  onMarkAllRead={markAllNotificationsRead}
                  onClear={clearNotifications}
                />
              )}
            </div>

            <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />

            <div className="hidden items-center gap-3 sm:flex">
              <Avatar initials={avatarInitials} />

              <div className="hidden md:block">
                <strong className="block max-w-[180px] truncate text-xs font-semibold text-white/75">
                  {displayName}
                </strong>

                <span className="text-[10px] text-white/30">
                  {displayRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div
          className={`mx-auto w-full max-w-[1500px] px-5 transition-all sm:px-8 lg:px-10 ${
            compactMode ? 'py-5 lg:py-6' : 'py-8 lg:py-10'
          }`}
        >
          {/* Welcome */}

          <section
            className={`flex flex-col justify-between xl:flex-row xl:items-end ${
              compactMode ? 'mb-5 gap-4' : 'mb-9 gap-6'
            }`}
          >
            <div>
              <div
                className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#39ff14]/70 ${
                  compactMode ? 'mb-2' : 'mb-4'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                MPlug Workspace
              </div>

              <h1
                className={`max-w-[700px] font-semibold leading-[1.15] tracking-[-0.03em] transition-all ${
                  compactMode
                    ? 'text-2xl sm:text-3xl lg:text-[36px]'
                    : 'text-3xl sm:text-4xl lg:text-[44px]'
                }`}
              >
                {greeting},
                <br />

                <span className="bg-gradient-to-r from-white via-white to-[#39ff14] bg-clip-text text-transparent">
                  {displayName}, let&apos;s get things moving.
                </span>
              </h1>

              <p
                className={`max-w-[600px] text-sm leading-6 text-white/35 sm:text-[15px] ${
                  compactMode ? 'mt-2' : 'mt-4'
                }`}
              >
                Stay focused, keep the team aligned,
                and turn today&apos;s responsibilities into
                meaningful progress.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className={`flex w-fit items-center gap-2.5 rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.09] text-sm font-semibold text-[#b9ffad] shadow-[0_0_30px_rgba(57,255,20,0.06)] transition hover:border-[#39ff14]/40 hover:bg-[#39ff14]/[0.14] ${
                compactMode ? 'px-4 py-2' : 'px-5 py-3'
              }`}
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

          <section
            className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 ${
              compactMode ? 'mb-5 gap-2.5' : 'mb-7 gap-4'
            }`}
          >
            <StatCard
              label="Total tasks"
              value={statistics.total}
              icon={<CheckCircle2 className="h-4 w-4" />}
              accent="green"
              description="Across your workspace"
            />

            <StatCard
              label="To do"
              value={statistics.todo}
              icon={<Circle className="h-4 w-4" />}
              accent="blue"
              description="Waiting to be started"
            />

            <StatCard
              label="In progress"
              value={statistics.inProgress}
              icon={<Circle className="h-4 w-4" />}
              accent="orange"
              description="Currently being worked on"
            />

            <StatCard
              label="Completed"
              value={statistics.completed}
              icon={<Check className="h-4 w-4" />}
              accent="purple"
              description="Successfully finished"
            />
          </section>

          {/* RECENT TASKS */}

          <section
            className={`overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.018] shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl ${
              compactMode ? 'mb-5' : 'mb-7'
            }`}
          >
            <div
              className={`border-b border-white/[0.05] sm:px-6 ${
                compactMode ? 'px-4 py-3' : 'px-5 py-5'
              }`}
            >
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

                  <p
                    className={`text-xs text-white/30 ${
                      compactMode ? 'mt-0.5' : 'mt-1.5'
                    }`}
                  >
                    Keep an eye on what&apos;s happening
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

              <div className={compactMode ? 'mt-3' : 'mt-5'}>
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
              <Loading compactMode={compactMode} />
            ) : tasks.length === 0 ? (
              <EmptyState
                search={searchValue}
                hasFilters={hasActiveFilters(filters)}
                compactMode={compactMode}
              />
            ) : (
              <div className="divide-y divide-white/[0.045]">
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

          {/* BOTTOM */}

          <section
            className={`grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] ${
              compactMode ? 'gap-3' : 'gap-5'
            }`}
          >
            {/* Workflow */}

            <div
              className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.035] to-white/[0.012] ${
                compactMode ? 'p-4' : 'p-6'
              }`}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#39ff14]/10 blur-[70px]" />

              <div className="relative flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-semibold tracking-[0.22em] text-[#39ff14]/60">
                    WORKFLOW
                  </span>

                  <h3
                    className={`font-semibold leading-tight text-white/90 ${
                      compactMode ? 'mt-1 text-lg' : 'mt-2 text-xl'
                    }`}
                  >
                    Your workspace
                    <br />

                    <span className="text-white/45">
                      at a glance
                    </span>
                  </h3>
                </div>

                <div
                  className={`flex items-center justify-center rounded-xl border border-[#39ff14]/10 bg-[#39ff14]/[0.06] text-[#39ff14] ${
                    compactMode ? 'h-9 w-9' : 'h-11 w-11'
                  }`}
                >
                  <Sparkles
                    className={
                      compactMode ? 'h-4 w-4' : 'h-5 w-5'
                    }
                  />
                </div>
              </div>

              <div className={compactMode ? 'mt-5' : 'mt-9'}>
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

                <div
                  className={`flex flex-wrap gap-x-6 gap-y-3 ${
                    compactMode ? 'mt-3' : 'mt-5'
                  }`}
                >
                  <Legend color="bg-[#38bdf8]" label="To do" />
                  <Legend color="bg-[#f59e0b]" label="In progress" />
                  <Legend color="bg-[#a855f7]" label="Completed" />
                </div>
              </div>
            </div>

            {/* Quick action */}

            <div
              className={`group relative overflow-hidden rounded-2xl border border-[#39ff14]/10 bg-[#39ff14]/[0.035] transition hover:border-[#39ff14]/20 hover:bg-[#39ff14]/[0.05] ${
                compactMode ? 'p-4' : 'p-6'
              }`}
            >
              <div className="absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-[#39ff14]/10 blur-[70px]" />

              <div className="relative flex h-full flex-col">
                <div
                  className={`flex items-center justify-center rounded-xl border border-[#39ff14]/15 bg-[#39ff14]/[0.08] text-[#39ff14] ${
                    compactMode ? 'mb-3 h-9 w-9' : 'mb-5 h-11 w-11'
                  }`}
                >
                  <Plus
                    className={
                      compactMode ? 'h-4 w-4' : 'h-5 w-5'
                    }
                  />
                </div>

                <span className="text-[9px] font-semibold tracking-[0.2em] text-[#39ff14]/55">
                  QUICK ACTION
                </span>

                <h3
                  className={`font-semibold text-white/85 ${
                    compactMode ? 'mt-1 text-base' : 'mt-2 text-lg'
                  }`}
                >
                  Create a new task
                </h3>

                <p
                  className={`max-w-[340px] text-xs leading-5 text-white/30 ${
                    compactMode ? 'mt-1' : 'mt-2'
                  }`}
                >
                  Turn an idea into an actionable
                  responsibility for your team.
                </p>

                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className={`mt-auto flex items-center justify-center self-end rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/40 transition hover:border-[#39ff14]/20 hover:bg-[#39ff14]/10 hover:text-[#39ff14] ${
                    compactMode ? 'h-9 w-9' : 'h-10 w-10'
                  }`}
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
        onClose={() => setCreateModalOpen(false)}
        onCreated={loadTasks}
      />

      {/* DETAILS */}

      <TaskDetailsModal
        task={selectedTask}
        open={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
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
        onClose={() => setDeleteTaskItem(null)}
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
   NOTIFICATION PANEL
========================================================================== */

function NotificationPanel({
  enabled,
  notifications,
  unreadCount,
  readNotificationIds,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClear,
}: {
  enabled: boolean;
  notifications: DashboardNotification[];
  unreadCount: number;
  readNotificationIds: string[];
  onClose: () => void;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onClear: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07100d]/95 shadow-[0_25px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              Notifications
            </h3>

            {enabled && unreadCount > 0 && (
              <span className="rounded-full bg-[#39ff14]/10 px-2 py-0.5 text-[9px] font-semibold text-[#39ff14]">
                {unreadCount} unread
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-white/30">
            Stay on top of your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.05] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!enabled ? (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-white/25">
            <Bell className="h-5 w-5" />
          </div>

          <h4 className="text-sm font-medium text-white/75">
            Notifications are off
          </h4>

          <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-white/30">
            Turn on notifications in Settings to
            receive task alerts here.
          </p>

          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#39ff14]/15 bg-[#39ff14]/[0.06] px-4 py-2 text-xs font-medium text-[#39ff14] transition hover:bg-[#39ff14]/10"
          >
            <Settings className="h-3.5 w-3.5" />
            Open Settings
          </Link>
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#39ff14]/10 bg-[#39ff14]/[0.04] text-[#39ff14]/70">
            <CheckCheck className="h-5 w-5" />
          </div>

          <h4 className="text-sm font-medium text-white/75">
            You&apos;re all caught up
          </h4>

          <p className="mt-2 text-xs leading-5 text-white/30">
            There are no urgent or overdue tasks
            right now.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2.5">
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-white/35 transition hover:text-[#39ff14] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>

            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 text-[10px] font-medium text-white/25 transition hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.map((notification) => {
              const read =
                readNotificationIds.includes(notification.id);

              return (
                <Link
                  key={notification.id}
                  href="/dashboard/my-tasks"
                  onClick={() => {
                    onMarkRead(notification.id);
                    onClose();
                  }}
                  className={`group block border-b border-white/[0.045] px-4 py-4 transition last:border-b-0 hover:bg-white/[0.025] ${
                    read ? 'opacity-55' : 'bg-[#39ff14]/[0.015]'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        notification.type === 'overdue'
                          ? 'bg-red-400/10 text-red-300'
                          : 'bg-orange-400/10 text-orange-300'
                      }`}
                    >
                      {notification.type === 'overdue' ? (
                        <Clock3 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-white/80">
                          {notification.title}
                        </p>

                        {!read && (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#39ff14] shadow-[0_0_7px_rgba(57,255,20,0.8)]" />
                        )}
                      </div>

                      <p className="mt-1 text-[11px] leading-5 text-white/35">
                        {notification.message}
                      </p>

                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-white/25 transition group-hover:text-[#39ff14]">
                        View task
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
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

function Avatar({
  initials,
}: {
  initials: string;
}) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#39ff14]/20 bg-[#39ff14]/10 text-[10px] font-bold text-[#39ff14]">
      {initials}
    </div>
  );
}

/* ==========================================================================
   LOADING
========================================================================== */

function Loading({
  compactMode,
}: {
  compactMode: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        compactMode
          ? 'min-h-[190px] gap-2'
          : 'min-h-[260px]'
      }`}
    >
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
  compactMode,
}: {
  search: string;
  hasFilters: boolean;
  compactMode: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-5 text-center ${
        compactMode
          ? 'min-h-[190px]'
          : 'min-h-[260px]'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-white/25 ${
          compactMode
            ? 'mb-2 h-11 w-11'
            : 'mb-4 h-14 w-14'
        }`}
      >
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
      <i className={`h-2 w-2 rounded-full ${color}`} />
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
