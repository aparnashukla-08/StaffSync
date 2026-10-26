import {
  User,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Announcement,
  ActivityItem
} from '../types';

const API_BASE = '/api';

export const getStoredToken = (): string | null => {
  return localStorage.getItem('staffsync_token');
};

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('staffsync_token', token);
  } else {
    localStorage.removeItem('staffsync_token');
  }
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// 1. Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await request<{ success: boolean; token: string; user: User; message?: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }
    );
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  register: async (userData: any) => {
    const res = await request<{ success: boolean; token: string; user: User; message?: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData)
      }
    );
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  getMe: async () => {
    return request<{ success: boolean; user: User }>('/auth/me');
  },

  updateProfile: async (profileData: Partial<User>) => {
    return request<{ success: boolean; user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  logout: () => {
    setStoredToken(null);
  }
};

// 2. Employees API
export const employeesApi = {
  getAll: async (params?: { search?: string; department?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.department) q.set('department', params.department);
    if (params?.status) q.set('status', params.status);

    const query = q.toString() ? `?${q.toString()}` : '';
    return request<{ success: boolean; employees: Employee[]; count: number }>(`/employees${query}`);
  },

  getById: async (id: string) => {
    return request<{ success: boolean; employee: Employee }>(`/employees/${id}`);
  },

  create: async (data: Omit<Employee, 'id'>) => {
    return request<{ success: boolean; employee: Employee; message: string }>('/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: string, data: Partial<Employee>) => {
    return request<{ success: boolean; employee: Employee; message: string }>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/employees/${id}`, {
      method: 'DELETE'
    });
  }
};

// 3. Attendance API
export const attendanceApi = {
  getAll: async (params?: { date?: string; department?: string; status?: string; employeeId?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.date) q.set('date', params.date);
    if (params?.department) q.set('department', params.department);
    if (params?.status) q.set('status', params.status);
    if (params?.employeeId) q.set('employeeId', params.employeeId);
    if (params?.search) q.set('search', params.search);

    const query = q.toString() ? `?${q.toString()}` : '';
    return request<{ success: boolean; attendance: AttendanceRecord[]; count: number }>(`/attendance${query}`);
  },

  getToday: async () => {
    return request<{ success: boolean; record: AttendanceRecord | null }>('/attendance/today');
  },

  checkIn: async (notes?: string) => {
    return request<{ success: boolean; record: AttendanceRecord; message: string }>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  },

  checkOut: async () => {
    return request<{ success: boolean; record: AttendanceRecord; message: string }>('/attendance/check-out', {
      method: 'POST'
    });
  },

  manualEntry: async (data: Omit<AttendanceRecord, 'id'>) => {
    return request<{ success: boolean; record: AttendanceRecord; message: string }>('/attendance/manual', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// 4. Leave API
export const leavesApi = {
  getAll: async (params?: { status?: string; department?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.department) q.set('department', params.department);
    if (params?.search) q.set('search', params.search);

    const query = q.toString() ? `?${q.toString()}` : '';
    return request<{ success: boolean; leaves: LeaveRequest[]; count: number }>(`/leaves${query}`);
  },

  getBalance: async (employeeId: string) => {
    return request<{ success: boolean; balance: any }>(`/leaves/balance/${employeeId}`);
  },

  apply: async (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    return request<{ success: boolean; leave: LeaveRequest; message: string }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  review: async (id: string, status: 'Approved' | 'Rejected', reviewNote?: string) => {
    return request<{ success: boolean; leave: LeaveRequest; message: string }>(`/leaves/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNote })
    });
  }
};

// 5. Announcements API
export const announcementsApi = {
  getAll: async (params?: { category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search) q.set('search', params.search);

    const query = q.toString() ? `?${q.toString()}` : '';
    return request<{ success: boolean; announcements: Announcement[]; count: number }>(`/announcements${query}`);
  },

  create: async (data: Omit<Announcement, 'id' | 'date' | 'readBy'>) => {
    return request<{ success: boolean; announcement: Announcement; message: string }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id: string, data: Partial<Announcement>) => {
    return request<{ success: boolean; announcement: Announcement; message: string }>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/announcements/${id}`, {
      method: 'DELETE'
    });
  },

  markRead: async (id: string) => {
    return request<{ success: boolean; announcement: Announcement }>(`/announcements/${id}/read`, {
      method: 'PATCH'
    });
  }
};

// 6. Dashboard & Activities API
export const dashboardApi = {
  getStats: async () => {
    return request<{
      success: boolean;
      stats: {
        totalEmployees: number;
        activeEmployees: number;
        presentToday: number;
        absentToday: number;
        pendingLeaves: number;
        departmentStats: Array<{ department: string; total: number; present: number; rate: number }>;
        weeklyTrend: Array<{ day: string; date: string; rate: number; present: number; total: number }>;
      };
    }>('/dashboard/stats');
  },

  getActivities: async () => {
    return request<{ success: boolean; activities: ActivityItem[] }>('/dashboard/activities');
  }
};

// 7. System API
export const systemApi = {
  getStatus: async () => {
    return request<{
      success: boolean;
      system: {
        connected: boolean;
        mode: string;
        mongoUriConfigured: boolean;
        counts?: Record<string, number>;
      };
    }>('/system/status');
  },

  seed: async () => {
    return request<{ success: boolean; message: string }>('/system/seed', {
      method: 'POST'
    });
  }
};
