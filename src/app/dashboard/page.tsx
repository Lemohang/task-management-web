'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getTasks,
  Task,
} from '@/lib/api';

type NavItem = {
  label: string;
  icon: React.ReactNode;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token =
          localStorage.getItem('accessToken');

        if (!token) {
          window.location.href = '/';
          return;
        }

        const response = await getTasks(token);

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
    };

    loadDashboard();
  }, []);

  const statistics = useMemo(() => {
    return {
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
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.description
          ?.toLowerCase()
          .includes(query) ||
        task.status
          .toLowerCase()
          .includes(query) ||
        task.priority
          .toLowerCase()
          .includes(query) ||
        task.assignedTo?.name
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [tasks, search]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'My Tasks',
      icon: <TaskIcon />,
    },
    {
      label: 'Team',
      icon: <UsersIcon />,
    },
    {
      label: 'Calendar',
      icon: <CalendarIcon />,
    },
  ];

  return (
    <main className="dashboard-page">

      {/* BACKGROUND */}

      <div className="dashboard-background">
        <div className="dashboard-glow glow-one" />
        <div className="dashboard-glow glow-two" />
        <div className="dashboard-glow glow-three" />

        <div className="dashboard-grid" />

        {Array.from({ length: 45 }).map(
          (_, index) => (
            <span
              key={index}
              className="dashboard-particle"
              style={{
                left: `${(index * 37) % 100}%`,
                top: `${(index * 61) % 100}%`,
                animationDelay: `${(
                  index * 0.17
                ).toFixed(2)}s`,
              }}
            />
          ),
        )}
      </div>

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen
            ? 'dashboard-sidebar-open'
            : ''
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo-wrap">
            <div className="sidebar-logo-glow" />

            <img
              src="/mpuglogo.png"
              alt="MPlug"
            />
          </div>

          <div>
            <strong>MPLUG</strong>

            <span>
              TASK MANAGEMENT
            </span>
          </div>
        </div>

        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              className={`sidebar-nav-item ${
                index === 0
                  ? 'sidebar-nav-active'
                  : ''
              }`}
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>

              {index === 0 && (
                <span className="active-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-section-label sidebar-section-spaced">
          SYSTEM
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-nav-item">
            <span className="nav-icon">
              <SettingsIcon />
            </span>

            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              MP
            </div>

            <div className="sidebar-user-info">
              <strong>MPlug Admin</strong>
              <span>Workspace</span>
            </div>

            <button
              className="sidebar-user-menu"
              aria-label="User menu"
            >
              <MoreIcon />
            </button>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <section className="dashboard-main">

        {/* TOP BAR */}

        <header className="dashboard-topbar">

          <button
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>

          <div className="topbar-search">
            <SearchIcon />

            <input
              type="text"
              placeholder="Search tasks, people, projects..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <span className="search-shortcut">
              ⌘ K
            </span>
          </div>

          <div className="topbar-actions">

            <button
              className="topbar-icon-button"
              aria-label="Notifications"
            >
              <BellIcon />
              <span className="notification-dot" />
            </button>

            <div className="topbar-divider" />

            <div className="topbar-profile">
              <div className="profile-avatar">
                MP
              </div>

              <div className="profile-text">
                <strong>MPlug Admin</strong>
                <span>Administrator</span>
              </div>

              <ChevronIcon />
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="dashboard-content">

          {/* WELCOME */}

          <section className="dashboard-heading">

            <div>
              <div className="dashboard-eyebrow">
                <span />
                MPlug Workspace
              </div>

              <h1>
                Good morning,
                <br />
                <span>let's get things moving.</span>
              </h1>

              <p>
                Stay focused, keep the team aligned,
                and turn today's responsibilities into
                meaningful progress.
              </p>
            </div>

            <button className="create-task-button">
              <PlusIcon />
              <span>Create task</span>
            </button>
          </section>

          {/* ERROR */}

          {error && (
            <div className="dashboard-error">
              <span>
                <AlertIcon />
              </span>

              <div>
                <strong>
                  Something went wrong
                </strong>

                <p>{error}</p>
              </div>
            </div>
          )}

          {/* STATISTICS */}

          <section className="stats-grid">

            <StatCard
              label="Total tasks"
              value={statistics.total}
              icon={<TaskIcon />}
              accent="green"
              description="Across your workspace"
            />

            <StatCard
              label="To do"
              value={statistics.todo}
              icon={<CircleIcon />}
              accent="blue"
              description="Waiting to be started"
            />

            <StatCard
              label="In progress"
              value={statistics.inProgress}
              icon={<ProgressIcon />}
              accent="orange"
              description="Currently being worked on"
            />

            <StatCard
              label="Completed"
              value={statistics.completed}
              icon={<CheckIcon />}
              accent="purple"
              description="Successfully finished"
            />

          </section>

          {/* TASK PANEL */}

          <section className="tasks-panel">

            <div className="panel-header">

              <div>
                <div className="panel-title-row">
                  <h2>Recent tasks</h2>

                  <span className="task-count">
                    {tasks.length}
                  </span>
                </div>

                <p>
                  Keep an eye on what's happening
                  across the workspace.
                </p>
              </div>

              <button className="view-all-button">
                View all
                <ArrowIcon />
              </button>

            </div>

            {loading ? (
              <div className="tasks-loading">

                <div className="loading-spinner" />

                <span>
                  Loading workspace...
                </span>

              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-tasks">
                <div className="empty-icon">
                  <TaskIcon />
                </div>

                <h3>No tasks found</h3>

                <p>
                  {search
                    ? 'Try adjusting your search.'
                    : 'Your workspace is ready for its first task.'}
                </p>
              </div>
            ) : (
              <div className="task-list">

                {filteredTasks.map(
                  (task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                    />
                  ),
                )}

              </div>
            )}

          </section>

          {/* BOTTOM GRID */}

          <section className="bottom-dashboard-grid">

            <div className="insight-card">

              <div className="insight-top">
                <div>
                  <span className="insight-label">
                    WORKFLOW
                  </span>

                  <h3>
                    Your workspace
                    <br />
                    at a glance
                  </h3>
                </div>

                <div className="insight-orb">
                  <SparkIcon />
                </div>
              </div>

              <div className="workflow-bar">
                <span
                  style={{
                    width: `${
                      statistics.total
                        ? Math.max(
                            4,
                            (statistics.todo /
                              statistics.total) *
                              100,
                          )
                        : 4
                    }%`,
                  }}
                />

                <span
                  style={{
                    width: `${
                      statistics.total
                        ? Math.max(
                            4,
                            (statistics.inProgress /
                              statistics.total) *
                              100,
                          )
                        : 4
                    }%`,
                  }}
                />

                <span
                  style={{
                    width: `${
                      statistics.total
                        ? Math.max(
                            4,
                            (statistics.completed /
                              statistics.total) *
                              100,
                          )
                        : 4
                    }%`,
                  }}
                />
              </div>

              <div className="workflow-legend">
                <span>
                  <i className="legend-todo" />
                  To do
                </span>

                <span>
                  <i className="legend-progress" />
                  In progress
                </span>

                <span>
                  <i className="legend-complete" />
                  Completed
                </span>
              </div>

            </div>

            <div className="quick-action-card">

              <div className="quick-action-icon">
                <PlusIcon />
              </div>

              <div>
                <span>
                  QUICK ACTION
                </span>

                <h3>
                  Create a new task
                </h3>

                <p>
                  Turn an idea into an actionable
                  responsibility for your team.
                </p>
              </div>

              <button>
                <ArrowIcon />
              </button>

            </div>

          </section>

        </div>
      </section>
    </main>
  );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  label,
  value,
  icon,
  accent,
  description,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent:
    | 'green'
    | 'blue'
    | 'orange'
    | 'purple';
  description: string;
}) {
  return (
    <div
      className={`stat-card stat-card-${accent}`}
    >
      <div className="stat-card-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span className="stat-more">
          <MoreIcon />
        </span>

      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>

      <div className="stat-description">
        {description}
      </div>

    </div>
  );
}

/* =========================================
   TASK ROW
========================================= */

function TaskRow({
  task,
}: {
  task: Task;
}) {
  const statusClass =
    task.status === 'COMPLETED'
      ? 'status-completed'
      : task.status === 'IN_PROGRESS'
        ? 'status-progress'
        : 'status-todo';

  const priorityClass =
    task.priority === 'URGENT'
      ? 'priority-urgent'
      : task.priority === 'HIGH'
        ? 'priority-high'
        : task.priority === 'MEDIUM'
          ? 'priority-medium'
          : 'priority-low';

  return (
    <div className="task-row">

      <div className="task-check">
        {task.status === 'COMPLETED' ? (
          <CheckIcon />
        ) : (
          <span />
        )}
      </div>

      <div className="task-main">

        <h3>{task.title}</h3>

        {task.description && (
          <p>{task.description}</p>
        )}

      </div>

      <div className="task-assignee">

        {task.assignedTo ? (
          <>
            <div className="assignee-avatar">
              {getInitials(
                task.assignedTo.name,
              )}
            </div>

            <span>
              {task.assignedTo.name}
            </span>
          </>
        ) : (
          <span className="unassigned">
            Unassigned
          </span>
        )}

      </div>

      <span
        className={`task-status ${statusClass}`}
      >
        <i />
        {formatStatus(task.status)}
      </span>

      <span
        className={`task-priority ${priorityClass}`}
      >
        {task.priority}
      </span>

      <div className="task-arrow">
        <ArrowIcon />
      </div>

    </div>
  );
}

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

/* =========================================
   ICONS
========================================= */

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
      />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M18 14.5a5.8 5.8 0 0 1 3 5.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M10 5H5v14h5" />
      <path d="M14 8l4 4-4 4M8 12h10" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 8 8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 4 21 20H3L12 4Z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}