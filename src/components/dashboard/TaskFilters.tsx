
'use client';

import {
  CalendarDays,
  RotateCcw,
  Search,
  SlidersHorizontal,
  User,
} from 'lucide-react';

import { TaskFilters as TaskFilterValues } from '@/lib/api';

type TaskFiltersProps = {
  filters: TaskFilterValues;
  onChange: (filters: TaskFilterValues) => void;
  onReset: () => void;
  users?: {
    id: number;
    name: string;
  }[];
};

export default function TaskFilters({
  filters,
  onChange,
  onReset,
  users = [],
}: TaskFiltersProps) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/[0.06]
        bg-white/[0.018]
        p-3
        backdrop-blur-xl
      "
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

        {/* SEARCH */}

        <div className="relative min-w-0 flex-1">
          <Search
            className="
              pointer-events-none
              absolute left-3 top-1/2
              h-4 w-4
              -translate-y-1/2
              text-white/20
            "
          />

          <input
            type="text"
            value={filters.search ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                search: event.target.value,
              })
            }
            placeholder="Search tasks..."
            className="
              h-10 w-full
              rounded-xl
              border border-white/[0.06]
              bg-white/[0.02]
              pl-10 pr-4
              text-xs text-white
              outline-none
              transition
              placeholder:text-white/20
              focus:border-[#39ff14]/25
              focus:bg-white/[0.035]
            "
          />
        </div>

        {/* STATUS */}

        <FilterSelect
          value={filters.status ?? ''}
          onChange={(value) =>
            onChange({
              ...filters,
              status: value
                ? (value as TaskFilterValues['status'])
                : undefined,
            })
          }
          options={[
            {
              value: '',
              label: 'All statuses',
            },
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

        {/* PRIORITY */}

        <FilterSelect
          value={filters.priority ?? ''}
          onChange={(value) =>
            onChange({
              ...filters,
              priority: value
                ? (value as TaskFilterValues['priority'])
                : undefined,
            })
          }
          options={[
            {
              value: '',
              label: 'All priorities',
            },
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

        {/* DUE DATE */}

        <FilterSelect
          value={filters.due ?? ''}
          onChange={(value) =>
            onChange({
              ...filters,
              due: value
                ? (value as TaskFilterValues['due'])
                : undefined,
            })
          }
          options={[
            {
              value: '',
              label: 'All due dates',
            },
            {
              value: 'overdue',
              label: 'Overdue',
            },
            {
              value: 'today',
              label: 'Due today',
            },
            {
              value: 'upcoming',
              label: 'Upcoming',
            },
          ]}
          icon={<CalendarDays className="h-3.5 w-3.5" />}
        />

        {/* ASSIGNED USER */}

        {users.length > 0 && (
          <FilterSelect
            value={
              filters.assignedTo
                ? String(filters.assignedTo)
                : ''
            }
            onChange={(value) =>
              onChange({
                ...filters,
                assignedTo: value
                  ? Number(value)
                  : undefined,
              })
            }
            options={[
              {
                value: '',
                label: 'All users',
              },
              ...users.map((user) => ({
                value: String(user.id),
                label: user.name,
              })),
            ]}
            icon={<User className="h-3.5 w-3.5" />}
          />
        )}

        {/* RESET */}

        <button
          type="button"
          onClick={onReset}
          className="
            flex h-10
            items-center justify-center
            gap-2
            rounded-xl
            border border-white/[0.06]
            bg-white/[0.02]
            px-4
            text-[10px]
            font-medium
            text-white/35
            transition
            hover:border-white/[0.12]
            hover:bg-white/[0.04]
            hover:text-white/70
          "
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}

/* =========================
   FILTER SELECT
========================= */

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <span
          className="
            pointer-events-none
            absolute left-3 top-1/2
            z-10
            -translate-y-1/2
            text-white/25
          "
        >
          {icon}
        </span>
      )}

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`
          h-10
          min-w-[135px]
          appearance-none
          rounded-xl
          border border-white/[0.06]
          bg-white/[0.02]
          pr-8
          text-[10px]
          text-white/50
          outline-none
          transition
          focus:border-[#39ff14]/25
          focus:bg-white/[0.035]
          ${icon ? 'pl-9' : 'pl-3'}
        `}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#07100d] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      <SlidersHorizontal
        className="
          pointer-events-none
          absolute right-3 top-1/2
          h-3 w-3
          text-white/20
        "
      />
    </div>
  );
}
