
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Filter,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import {
  getTasks,
  getUsers,
  createTask,
  Task,
  AssignedUser,
} from '@/lib/api';

import TaskDetailsModal from '@/components/dashboard/TaskDetailsModal';

type CalendarView =
  | 'month'
  | 'week'
  | 'agenda';

type QuickTaskForm = {
  title: string;
  description: string;
  priority: Task['priority'];
  dueDate: string;
  assignedToId: string;
};

export default function CalendarPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<
    AssignedUser[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [currentDate, setCurrentDate] =
    useState(() => new Date());

  const [selectedDate, setSelectedDate] =
    useState(() => new Date());

  const [view, setView] =
    useState<CalendarView>('month');

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState<'ALL' | Task['status']>('ALL');

  const [priorityFilter, setPriorityFilter] =
    useState<'ALL' | Task['priority']>('ALL');

  const [quickTask, setQuickTask] =
    useState<QuickTaskForm>({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: '',
      assignedToId: '',
    });

  /*
   * --------------------------------------------------
   * LOAD DATA
   * --------------------------------------------------
   */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        router.push('/');
        return;
      }

      const [taskResponse, userResponse] =
        await Promise.all([
          getTasks(token, 1, 100),
          getUsers(token).catch(() => []),
        ]);

      const responseData =
        taskResponse as unknown;

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
          taskList =
            result.data as Task[];
        } else if (
          Array.isArray(result.tasks)
        ) {
          taskList =
            result.tasks as Task[];
        }
      }

      setTasks(taskList);

      setUsers(
        Array.isArray(userResponse)
          ? userResponse
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load calendar.',
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
   * --------------------------------------------------
   * FILTER TASKS
   * --------------------------------------------------
   */

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query =
        search.trim().toLowerCase();

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

  /*
   * --------------------------------------------------
   * MONTH DATA
   * --------------------------------------------------
   */

  const monthTasks = useMemo(() => {
    return filteredTasks.filter((task) => {
      if (!task.dueDate) return false;

      const date = new Date(task.dueDate);

      return (
        date.getMonth() ===
          currentDate.getMonth() &&
        date.getFullYear() ===
          currentDate.getFullYear()
      );
    });
  }, [filteredTasks, currentDate]);

  const monthInProgress =
    monthTasks.filter(
      (task) =>
        task.status === 'IN_PROGRESS',
    ).length;

  const monthTodo =
    monthTasks.filter(
      (task) => task.status === 'TODO',
    ).length;

  const monthOverdue =
    monthTasks.filter((task) =>
      isOverdue(task),
    ).length;

  /*
   * --------------------------------------------------
   * CALENDAR DAYS
   * --------------------------------------------------
   */

  const calendarDays = useMemo(
    () =>
      buildCalendarDays(currentDate),
    [currentDate],
  );

  const weekDays = useMemo(
    () => buildWeekDays(selectedDate),
    [selectedDate],
  );

  const selectedTasks = useMemo(() => {
    return filteredTasks
      .filter((task) => {
        if (!task.dueDate) return false;

        return isSameDay(
          new Date(task.dueDate),
          selectedDate,
        );
      })
      .sort(sortTasks);
  }, [
    filteredTasks,
    selectedDate,
  ]);

  /*
   * --------------------------------------------------
   * NAVIGATION
   * --------------------------------------------------
   */

  const previous = () => {
    if (view === 'month') {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1,
        ),
      );
      return;
    }

    if (view === 'week') {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() - 7);

      setSelectedDate(date);
      setCurrentDate(date);
      return;
    }

    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);

    setSelectedDate(date);
    setCurrentDate(date);
  };

  const next = () => {
    if (view === 'month') {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          1,
        ),
      );
      return;
    }

    if (view === 'week') {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + 7);

      setSelectedDate(date);
      setCurrentDate(date);
      return;
    }

    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);

    setSelectedDate(date);
    setCurrentDate(date);
  };

  const goToday = () => {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDate(today);
  };

  /*
   * --------------------------------------------------
   * QUICK CREATE
   * --------------------------------------------------
   */

  const openCreate = (date?: Date) => {
    const target =
      date ?? selectedDate;

    setQuickTask({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: toDateInput(target),
      assignedToId: '',
    });

    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!quickTask.title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        router.push('/');
        return;
      }

      await createTask(token, {
        title: quickTask.title.trim(),
        description:
          quickTask.description.trim() ||
          undefined,
        priority: quickTask.priority,
        dueDate:
          quickTask.dueDate || undefined,
        assignedToId:
          quickTask.assignedToId
            ? Number(
                quickTask.assignedToId,
              )
            : undefined,
      });

      setShowCreate(false);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create task.',
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#020706] text-white">
      {/* Ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#39ff14]/[0.035] blur-[130px]" />

        <div className="absolute right-[-180px] top-[30%] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.025] blur-[130px]" />

        <div className="absolute bottom-[-250px] left-[30%] h-[450px] w-[450px] rounded-full bg-[#39ff14]/[0.018] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#39ff14]/70">
                <CalendarDays className="h-4 w-4" />
                Command Center
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Calendar
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
                See your team&apos;s workload,
                deadlines, and upcoming work
                at a glance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goToday}
                className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:border-[#39ff14]/20 hover:bg-[#39ff14]/[0.04] hover:text-white"
              >
                Today
              </button>

              <button
                onClick={() => openCreate()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#39ff14] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_25px_rgba(57,255,20,0.12)] transition hover:bg-[#45ff22] hover:shadow-[0_0_30px_rgba(57,255,20,0.2)]"
              >
                <Plus className="h-4 w-4" />
                New Task
              </button>
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Scheduled"
            value={monthTasks.length}
            icon={CalendarDays}
          />

          <StatCard
            label="To Do"
            value={monthTodo}
            icon={Circle}
          />

          <StatCard
            label="In Progress"
            value={monthInProgress}
            icon={Clock3}
          />

          <StatCard
            label="Overdue"
            value={monthOverdue}
            icon={AlertCircle}
            danger={monthOverdue > 0}
          />
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              onClick={() => setError('')}
              className="text-red-300/60 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* COMMAND BAR */}
        <section className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 backdrop-blur-xl">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative min-w-0 flex-1 xl:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search calendar tasks..."
                className="h-10 w-full rounded-xl border border-white/[0.06] bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#39ff14]/25"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status */}
              <FilterSelect
                icon={Filter}
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(
                    value as
                      | 'ALL'
                      | Task['status'],
                  )
                }
                options={[
                  ['ALL', 'All status'],
                  ['TODO', 'To Do'],
                  [
                    'IN_PROGRESS',
                    'In Progress',
                  ],
                  [
                    'COMPLETED',
                    'Completed',
                  ],
                ]}
              />

              {/* Priority */}
              <FilterSelect
                value={priorityFilter}
                onChange={(value) =>
                  setPriorityFilter(
                    value as
                      | 'ALL'
                      | Task['priority'],
                  )
                }
                options={[
                  ['ALL', 'All priority'],
                  ['LOW', 'Low'],
                  ['MEDIUM', 'Medium'],
                  ['HIGH', 'High'],
                  ['URGENT', 'Urgent'],
                ]}
              />

              {/* View switcher */}
              <div className="flex h-10 rounded-xl border border-white/[0.06] bg-black/20 p-1">
                <ViewButton
                  active={view === 'month'}
                  icon={LayoutGrid}
                  label="Month"
                  onClick={() =>
                    setView('month')
                  }
                />

                <ViewButton
                  active={view === 'week'}
                  icon={CalendarDays}
                  label="Week"
                  onClick={() =>
                    setView('week')
                  }
                />

                <ViewButton
                  active={view === 'agenda'}
                  icon={List}
                  label="Agenda"
                  onClick={() =>
                    setView('agenda')
                  }
                />
              </div>

              <button
                onClick={loadData}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 text-white/35 transition hover:border-[#39ff14]/20 hover:text-[#39ff14] disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? 'animate-spin'
                      : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* MAIN CALENDAR */}
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            calendarDays={calendarDays}
            tasks={filteredTasks}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
            }}
            onPrevious={previous}
            onNext={next}
            onTaskClick={setSelectedTask}
            onCreate={openCreate}
          />
        )}

        {view === 'week' && (
          <WeekView
            weekDays={weekDays}
            tasks={filteredTasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevious={previous}
            onNext={next}
            onTaskClick={setSelectedTask}
            onCreate={openCreate}
          />
        )}

        {view === 'agenda' && (
          <AgendaView
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
          />
        )}

        {/* SELECTED DAY */}
        {view !== 'agenda' && (
          <SelectedDay
            date={selectedDate}
            tasks={selectedTasks}
            onTaskClick={setSelectedTask}
            onCreate={() =>
              openCreate(selectedDate)
            }
          />
        )}
      </div>

      {/* TASK DETAILS */}
      <TaskDetailsModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() =>
          setSelectedTask(null)
        }
        onEdit={() => {
          setSelectedTask(null);
          router.push('/dashboard/my-tasks');
        }}
        onDelete={() => {
          setSelectedTask(null);
          router.push('/dashboard/my-tasks');
        }}
      />

      {/* QUICK CREATE */}
      {showCreate && (
        <QuickCreateModal
          form={quickTask}
          users={users}
          saving={saving}
          onChange={setQuickTask}
          onClose={() =>
            setShowCreate(false)
          }
          onSubmit={handleCreate}
        />
      )}
    </main>
  );
}

/*
 * ======================================================
 * MONTH VIEW
 * ======================================================
 */

function MonthView({
  currentDate,
  calendarDays,
  tasks,
  selectedDate,
  onSelectDate,
  onPrevious,
  onNext,
  onTaskClick,
  onCreate,
}: {
  currentDate: Date;
  calendarDays: { date: Date }[];
  tasks: Task[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  onTaskClick: (task: Task) => void;
  onCreate: (date?: Date) => void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <CalendarHeader
        title={currentDate.toLocaleDateString(
          undefined,
          {
            month: 'long',
            year: 'numeric',
          },
        )}
        subtitle="Monthly workload"
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <div className="p-3 sm:p-5">
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.015]">
            {[
              'sun',
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'sat',
            ].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25 sm:text-xs"
              >
                <span className="sm:hidden">
                  {day.charAt(0)}
                </span>

                <span className="hidden sm:inline">
                  {day}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map(
              ({ date }, index) => {
                const dayTasks =
                  getTasksForDay(
                    tasks,
                    date,
                  );

                const currentMonth =
                  date.getMonth() ===
                    currentDate.getMonth() &&
                  date.getFullYear() ===
                    currentDate.getFullYear();

                const today =
                  isSameDay(
                    date,
                    new Date(),
                  );

                const selected =
                  isSameDay(
                    date,
                    selectedDate,
                  );

                return (
                  <button
                    key={`${date.toISOString()}-${index}`}
                    onClick={() =>
                      onSelectDate(date)
                    }
                    onDoubleClick={() =>
                      onCreate(date)
                    }
                    className={`group relative min-h-[115px] border-b border-r border-white/[0.05] p-2 text-left transition-all duration-200 sm:min-h-[145px] sm:p-3 ${
                      currentMonth
                        ? 'hover:bg-white/[0.025]'
                        : 'opacity-25'
                    } ${
                      selected
                        ? 'bg-[#39ff14]/[0.025]'
                        : ''
                    }`}
                  >
                    {selected && (
                      <span className="absolute inset-y-0 left-0 w-px bg-[#39ff14]/60 shadow-[0_0_8px_rgba(57,255,20,0.4)]" />
                    )}

                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition ${
                          today
                            ? 'bg-[#39ff14] text-black shadow-[0_0_18px_rgba(57,255,20,0.3)]'
                            : 'text-white/45 group-hover:text-white'
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      {dayTasks.length > 0 && (
                        <DensityDots
                          tasks={dayTasks}
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayTasks
                        .slice(0, 3)
                        .map((task) => (
                          <TaskPill
                            key={task.id}
                            task={task}
                            onClick={(event) => {
                              event.stopPropagation();
                              onTaskClick(task);
                            }}
                          />
                        ))}

                      {dayTasks.length >
                        3 && (
                        <div className="px-1 text-[9px] font-semibold text-[#39ff14]/55">
                          +
                          {dayTasks.length -
                            3}{' '}
                          more
                        </div>
                      )}
                    </div>

                    <span className="pointer-events-none absolute bottom-2 right-2 hidden text-[8px] text-white/10 group-hover:block">
                      Double-click to add
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * ======================================================
 * WEEK VIEW
 * ======================================================
 */

function WeekView({
  weekDays,
  tasks,
  selectedDate,
  onSelectDate,
  onPrevious,
  onNext,
  onTaskClick,
  onCreate,
}: {
  weekDays: Date[];
  tasks: Task[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  onTaskClick: (task: Task) => void;
  onCreate: (date?: Date) => void;
}) {
  const weekStart = weekDays[0];
  const weekEnd =
    weekDays[6];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <CalendarHeader
        title={`${formatShortDate(
          weekStart,
        )} — ${formatShortDate(
          weekEnd,
        )}`}
        subtitle="Weekly workload"
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {weekDays.map((date) => {
              const selected =
                isSameDay(
                  date,
                  selectedDate,
                );

              const today =
                isSameDay(
                  date,
                  new Date(),
                );

              const dayTasks =
                getTasksForDay(
                  tasks,
                  date,
                );

              return (
                <button
                  key={date.toISOString()}
                  onClick={() =>
                    onSelectDate(date)
                  }
                  className={`border-r border-white/[0.05] p-4 text-left transition ${
                    selected
                      ? 'bg-[#39ff14]/[0.025]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">
                      {date.toLocaleDateString(
                        undefined,
                        {
                          weekday: 'short',
                        },
                      )}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-white/25">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                        today
                          ? 'bg-[#39ff14] text-black'
                          : selected
                            ? 'bg-[#39ff14]/10 text-[#39ff14]'
                            : 'text-white/55'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-7">
            {weekDays.map((date) => {
              const dayTasks =
                getTasksForDay(
                  tasks,
                  date,
                );

              return (
                <div
                  key={date.toISOString()}
                  className="min-h-[430px] border-r border-white/[0.05] p-3"
                >
                  <div className="space-y-2">
                    {dayTasks.length ===
                    0 ? (
                      <button
                        onClick={() =>
                          onCreate(date)
                        }
                        className="flex w-full items-center justify-center rounded-xl border border-dashed border-white/[0.06] py-8 text-[10px] text-white/15 transition hover:border-[#39ff14]/20 hover:text-[#39ff14]/50"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add task
                      </button>
                    ) : (
                      dayTasks
                        .sort(sortTasks)
                        .map((task) => (
                          <button
                            key={task.id}
                            onClick={() =>
                              onTaskClick(
                                task,
                              )
                            }
                            className={`w-full rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${getTaskCardStyle(
                              task,
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-medium text-white/80">
                                {task.title}
                              </span>

                              <TaskStatusDot
                                status={
                                  task.status
                                }
                              />
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-wider text-white/25">
                                {task.priority}
                              </span>

                              {task.assignedTo && (
                                <span className="max-w-[80px] truncate text-[9px] text-white/25">
                                  {
                                    task
                                      .assignedTo
                                      .name
                                  }
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * ======================================================
 * AGENDA VIEW
 * ======================================================
 */

function AgendaView({
  tasks,
  onTaskClick,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const upcoming = tasks
    .filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) >=
          startOfDay(new Date()),
    )
    .sort(
      (a, b) =>
        new Date(
          a.dueDate!,
        ).getTime() -
        new Date(
          b.dueDate!,
        ).getTime(),
    );

  const grouped = new Map<
    string,
    Task[]
  >();

  upcoming.forEach((task) => {
    const key = toDayKey(
      new Date(task.dueDate!),
    );

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key)!.push(task);
  });

  return (
    <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39ff14]/60">
          Agenda
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Upcoming work
        </h2>

        <p className="mt-1 text-xs text-white/30">
          Your next scheduled deadlines
        </p>
      </div>

      {grouped.size === 0 ? (
        <EmptyCalendar />
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {Array.from(
            grouped.entries(),
          ).map(
            ([key, dayTasks]) => {
              const date = new Date(
                `${key}T00:00:00`,
              );

              return (
                <div
                  key={key}
                  className="p-5 sm:p-6"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[#39ff14]/10 bg-[#39ff14]/[0.05]">
                      <span className="text-[9px] uppercase tracking-wider text-[#39ff14]/60">
                        {date.toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                          },
                        )}
                      </span>

                      <span className="text-lg font-semibold text-[#39ff14]">
                        {date.getDate()}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {date.toLocaleDateString(
                          undefined,
                          {
                            weekday:
                              'long',
                          },
                        )}
                      </p>

                      <p className="mt-1 text-xs text-white/25">
                        {
                          dayTasks.length
                        }{' '}
                        scheduled
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dayTasks.map(
                      (task) => (
                        <button
                          key={task.id}
                          onClick={() =>
                            onTaskClick(
                              task,
                            )
                          }
                          className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left transition hover:border-[#39ff14]/10 hover:bg-white/[0.035]"
                        >
                          <TaskStatusIcon
                            status={
                              task.status
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white/85">
                              {
                                task.title
                              }
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[9px] text-white/30">
                                {
                                  task.priority
                                }
                              </span>

                              {task.assignedTo && (
                                <span className="text-[10px] text-white/25">
                                  {
                                    task
                                      .assignedTo
                                      .name
                                  }
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`hidden rounded-full px-2.5 py-1 text-[9px] font-medium sm:block ${getStatusBadge(
                              task.status,
                            )}`}
                          >
                            {formatStatus(
                              task.status,
                            )}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

/*
 * ======================================================
 * SELECTED DAY
 * ======================================================
 */

function SelectedDay({
  date,
  tasks,
  onTaskClick,
  onCreate,
}: {
  date: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreate: () => void;
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.8)]" />

            <h2 className="text-sm font-semibold">
              {date.toLocaleDateString(
                undefined,
                {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                },
              )}
            </h2>
          </div>

          <p className="mt-1 text-xs text-white/30">
            {tasks.length === 0
              ? 'Nothing scheduled for this day'
              : `${tasks.length} ${
                  tasks.length === 1
                    ? 'task'
                    : 'tasks'
                } scheduled`}
          </p>
        </div>

        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39ff14] px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-[#45ff22] hover:shadow-[0_0_20px_rgba(57,255,20,0.18)]"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-white/20">
            <CalendarDays className="h-6 w-6" />
          </div>

          <h3 className="text-sm font-medium text-white/70">
            Clear schedule
          </h3>

          <p className="mt-2 text-xs text-white/30">
            No tasks are scheduled for this
            day.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05]">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() =>
                onTaskClick(task)
              }
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.025] sm:px-6"
            >
              <TaskStatusIcon
                status={task.status}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {task.title}
                </p>

                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="text-[10px] text-white/25">
                    {task.priority}
                  </span>

                  {task.assignedTo && (
                    <>
                      <span className="text-white/10">
                        •
                      </span>

                      <span className="text-[10px] text-white/25">
                        {
                          task
                            .assignedTo
                            .name
                        }
                      </span>
                    </>
                  )}
                </div>
              </div>

              <span
                className={`hidden rounded-full px-2.5 py-1 text-[9px] font-medium sm:block ${getStatusBadge(
                  task.status,
                )}`}
              >
                {formatStatus(
                  task.status,
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/*
 * ======================================================
 * QUICK CREATE MODAL
 * ======================================================
 */

function QuickCreateModal({
  form,
  users,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  form: QuickTaskForm;
  users: AssignedUser[];
  saving: boolean;
  onChange: (
    form: QuickTaskForm,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-[#06100d] shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#39ff14]/60">
              Quick Create
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              New Task
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <Field label="Task title">
            <input
              value={form.title}
              onChange={(event) =>
                onChange({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              placeholder="What needs to be done?"
              autoFocus
              className="input"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(event) =>
                onChange({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              placeholder="Add some context..."
              rows={3}
              className="input resize-none py-3"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Due date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  onChange({
                    ...form,
                    dueDate:
                      event.target.value,
                  })
                }
                className="input"
              />
            </Field>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(event) =>
                  onChange({
                    ...form,
                    priority:
                      event.target
                        .value as Task['priority'],
                  })
                }
                className="input"
              >
                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="URGENT">
                  Urgent
                </option>
              </select>
            </Field>
          </div>

          {users.length > 0 && (
            <Field label="Assign to">
              <select
                value={form.assignedToId}
                onChange={(event) =>
                  onChange({
                    ...form,
                    assignedToId:
                      event.target.value,
                  })
                }
                className="input"
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
            </Field>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-sm text-white/40 transition hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={
              saving ||
              !form.title.trim()
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#39ff14] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#45ff22] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}

            {saving
              ? 'Creating...'
              : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 * ======================================================
 * SMALL COMPONENTS
 * ======================================================
 */

function CalendarHeader({
  title,
  subtitle,
  onPrevious,
  onNext,
}: {
  title: string;
  subtitle: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5 sm:px-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-xs text-white/25">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:border-[#39ff14]/20 hover:text-[#39ff14]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={onNext}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:border-[#39ff14]/20 hover:text-[#39ff14]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-medium transition sm:px-3 sm:text-xs ${
        active
          ? 'bg-[#39ff14]/10 text-[#39ff14]'
          : 'text-white/30 hover:text-white/70'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />

      <span className="hidden sm:inline">
        {label}
      </span>
    </button>
  );
}

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon?: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
      )}

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`h-10 appearance-none rounded-xl border border-white/[0.06] bg-black/20 pr-8 text-xs text-white/50 outline-none transition focus:border-[#39ff14]/25 ${
          Icon
            ? 'pl-9'
            : 'pl-3'
        }`}
      >
        {options.map(
          ([optionValue, label]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {label}
            </option>
          ),
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/20" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  danger = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white/[0.025] p-4 backdrop-blur-xl transition ${
        danger
          ? 'border-red-400/10'
          : 'border-white/[0.07]'
      }`}
    >
      <div
        className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${
          danger
            ? 'bg-red-400/[0.08] text-red-300'
            : 'bg-[#39ff14]/[0.07] text-[#39ff14]'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-white/30">
        {label}
      </p>
    </div>
  );
}

function TaskPill({
  task,
  onClick,
}: {
  task: Task;
  onClick: (
    event: React.MouseEvent,
  ) => void;
}) {
  const overdue = isOverdue(task);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer truncate rounded-md border px-1.5 py-1 text-[9px] font-medium transition hover:brightness-125 sm:text-[10px] ${
        overdue
          ? 'border-red-400/15 bg-red-400/[0.06] text-red-300'
          : task.status ===
              'COMPLETED'
            ? 'border-[#39ff14]/10 bg-[#39ff14]/[0.06] text-[#39ff14]'
            : task.status ===
                'IN_PROGRESS'
              ? 'border-blue-400/10 bg-blue-400/[0.06] text-blue-300'
              : 'border-white/[0.06] bg-white/[0.035] text-white/45'
      }`}
    >
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle" />

      {task.title}
    </div>
  );
}

function DensityDots({
  tasks,
}: {
  tasks: Task[];
}) {
  const count = Math.min(
    tasks.length,
    5,
  );

  return (
    <div className="flex gap-0.5">
      {Array.from({
        length: count,
      }).map((_, index) => (
        <span
          key={index}
          className={`h-1 w-1 rounded-full ${
            tasks.some(
              (task) =>
                task.priority ===
                'URGENT',
            )
              ? 'bg-red-400'
              : 'bg-[#39ff14]/60'
          }`}
        />
      ))}
    </div>
  );
}

function TaskStatusDot({
  status,
}: {
  status: Task['status'];
}) {
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${
        status === 'COMPLETED'
          ? 'bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.7)]'
          : status === 'IN_PROGRESS'
            ? 'bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.5)]'
            : 'bg-white/25'
      }`}
    />
  );
}

function TaskStatusIcon({
  status,
}: {
  status: Task['status'];
}) {
  const classes =
    status === 'COMPLETED'
      ? 'bg-[#39ff14]/[0.08] text-[#39ff14]'
      : status === 'IN_PROGRESS'
        ? 'bg-blue-400/[0.08] text-blue-300'
        : 'bg-white/[0.04] text-white/30';

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${classes}`}
    >
      {status === 'COMPLETED' ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : status === 'IN_PROGRESS' ? (
        <Clock3 className="h-4 w-4" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
    </div>
  );
}

function EmptyCalendar() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-white/20">
        <CalendarDays className="h-6 w-6" />
      </div>

      <h3 className="text-sm font-medium text-white/70">
        Nothing scheduled
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-white/30">
        There are no upcoming tasks matching
        your current filters.
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
        {label}
      </span>

      {children}
    </label>
  );
}

/*
 * ======================================================
 * HELPERS
 * ======================================================
 */

function buildCalendarDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(
    year,
    month,
    1,
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const daysInPreviousMonth =
    new Date(
      year,
      month,
      0,
    ).getDate();

  const total =
    firstDay + daysInMonth <= 35
      ? 35
      : 42;

  const days: { date: Date }[] =
    [];

  for (
    let index = firstDay - 1;
    index >= 0;
    index--
  ) {
    days.push({
      date: new Date(
        year,
        month - 1,
        daysInPreviousMonth -
          index,
      ),
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push({
      date: new Date(
        year,
        month,
        day,
      ),
    });
  }

  let nextDay = 1;

  while (days.length < total) {
    days.push({
      date: new Date(
        year,
        month + 1,
        nextDay++,
      ),
    });
  }

  return days;
}

function buildWeekDays(date: Date) {
  const result: Date[] = [];
  const current = new Date(date);

  const day =
    current.getDay();

  current.setDate(
    current.getDate() - day,
  );

  for (let index = 0; index < 7; index++) {
    result.push(
      new Date(current),
    );

    current.setDate(
      current.getDate() + 1,
    );
  }

  return result;
}

function getTasksForDay(
  tasks: Task[],
  date: Date,
) {
  return tasks.filter((task) => {
    if (!task.dueDate) return false;

    return isSameDay(
      new Date(task.dueDate),
      date,
    );
  });
}

function isSameDay(
  first: Date,
  second: Date,
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function startOfDay(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function isOverdue(task: Task) {
  if (
    !task.dueDate ||
    task.status === 'COMPLETED'
  ) {
    return false;
  }

  return (
    new Date(task.dueDate).getTime() <
    startOfDay(new Date()).getTime()
  );
}

function sortTasks(
  first: Task,
  second: Task,
) {
  const firstDate = first.dueDate
    ? new Date(
        first.dueDate,
      ).getTime()
    : Infinity;

  const secondDate =
    second.dueDate
      ? new Date(
          second.dueDate,
        ).getTime()
      : Infinity;

  return (
    firstDate - secondDate
  );
}

function toDateInput(date: Date) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toDayKey(date: Date) {
  return toDateInput(date);
}

function formatShortDate(
  date: Date,
) {
  return date.toLocaleDateString(
    undefined,
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatStatus(
  status: Task['status'],
) {
  return status
    .replace('_', ' ')
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function getStatusBadge(
  status: Task['status'],
) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-[#39ff14]/[0.08] text-[#39ff14]';

    case 'IN_PROGRESS':
      return 'bg-blue-400/[0.08] text-blue-300';

    default:
      return 'bg-white/[0.05] text-white/40';
  }
}

function getTaskCardStyle(
  task: Task,
) {
  if (isOverdue(task)) {
    return 'border-red-400/10 bg-red-400/[0.035]';
  }

  if (task.status === 'COMPLETED') {
    return 'border-[#39ff14]/10 bg-[#39ff14]/[0.035]';
  }

  if (task.status === 'IN_PROGRESS') {
    return 'border-blue-400/10 bg-blue-400/[0.035]';
  }

  return 'border-white/[0.06] bg-white/[0.02]';
}
