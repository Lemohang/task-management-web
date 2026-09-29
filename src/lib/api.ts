
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export interface AssignedUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status:
    | 'TODO'
    | 'IN_PROGRESS'
    | 'COMPLETED';
  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT';
  dueDate: string | null;
  assignedTo: AssignedUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface TasksMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TasksResponse {
  data: Task[];
  meta: TasksMeta;
}

/* =========================
   TASK FILTERS
========================= */

export type TaskFilters = {
  status?: Task['status'];
  priority?: Task['priority'];
  due?:
    | 'overdue'
    | 'today'
    | 'upcoming';
  search?: string;
  assignedTo?: number;
};

/* =========================
   AUTHENTICATION
========================= */

export async function login(
  email: string,
  password: string,
) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message[0]
        : data.message ||
          'Unable to sign in.',
    );
  }

  return data;
}

/* =========================
   GET TASKS
========================= */

export async function getTasks(
  accessToken: string,
  page = 1,
  limit = 10,
  filters: TaskFilters = {},
): Promise<TasksResponse> {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('limit', String(limit));

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.priority) {
    params.set('priority', filters.priority);
  }

  if (filters.due) {
    params.set('due', filters.due);
  }

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.assignedTo) {
    params.set(
      'assignedTo',
      String(filters.assignedTo),
    );
  }

  const response = await fetch(
    `${API_URL}/tasks?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message[0]
        : data.message ||
          'Unable to load tasks.',
    );
  }

  return data;
}

/* =========================
   GET MY TASKS
========================= */

export async function getMyTasks(
  accessToken: string,
  page = 1,
  limit = 10,
  filters: TaskFilters = {},
): Promise<TasksResponse> {
  const params = new URLSearchParams();

  params.set('page', String(page));
  params.set('limit', String(limit));

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.priority) {
    params.set('priority', filters.priority);
  }

  if (filters.due) {
    params.set('due', filters.due);
  }

  if (filters.search?.trim()) {
    params.set(
      'search',
      filters.search.trim(),
    );
  }

  const response = await fetch(
    `${API_URL}/tasks/my?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message[0]
        : data.message ||
          'Unable to load your tasks.',
    );
  }

  return data;
}




/* =========================
   GET USERS
========================= */

export async function getUsers(
  accessToken: string,
): Promise<AssignedUser[]> {
  const response = await fetch(
    `${API_URL}/users`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message[0]
        : data.message ||
          'Unable to load users.',
    );
  }

  return data;
}

/* =========================
   CREATE TASK
========================= */

export async function createTask(
  accessToken: string,
  task: {
    title: string;
    description?: string;
    status?:
      | 'TODO'
      | 'IN_PROGRESS'
      | 'COMPLETED';
    priority?:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | 'URGENT';
    dueDate?: string;
    assignedToId?: number;
  },
) {
  const response = await fetch(
    `${API_URL}/tasks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message[0]
        : data.message ||
          'Unable to create task.',
    );
  }

  return data;
}

/* =========================
   UPDATE TASK
========================= */

export async function updateTask(
  accessToken: string,
  taskId: number,
  updates: Partial<{
    title: string;
    description: string;
    status:
      | 'TODO'
      | 'IN_PROGRESS'
      | 'COMPLETED';
    priority:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | 'URGENT';
    dueDate: string;
    assignedToId: number;
  }>,
) {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message[0]
        : data.message ||
          'Unable to update task.',
    );
  }

  return data;
}

/* =========================
   UPDATE TASK STATUS
========================= */

export async function updateTaskStatus(
  accessToken: string,
  taskId: number,
  status: Task['status'],
) {
  return updateTask(
    accessToken,
    taskId,
    {
      status,
    },
  );
}

/* =========================
   DELETE TASK
========================= */

export async function deleteTask(
  accessToken: string,
  taskId: number,
) {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      Array.isArray(data.message)
        ? data.message[0]
        : data.message ||
          'Unable to delete task.',
    );
  }

  return true;
}

