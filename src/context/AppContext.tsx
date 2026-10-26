import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Announcement,
  ActivityItem,
  User,
  UserRole
} from '../types';
import {
  authApi,
  employeesApi,
  attendanceApi,
  leavesApi,
  announcementsApi,
  dashboardApi,
  systemApi,
  getStoredToken,
  setStoredToken
} from '../services/api';
import { DEMO_USERS } from '../data/mockData';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  loginAs: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  attendance: AttendanceRecord[];
  todayAttendance: AttendanceRecord | undefined;
  userCheckIn: (notes?: string) => Promise<void>;
  userCheckOut: () => Promise<void>;
  addManualAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;

  leaveRequests: LeaveRequest[];
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  reviewLeave: (id: string, status: 'Approved' | 'Rejected', note?: string) => Promise<void>;

  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date' | 'readBy'>) => Promise<void>;
  markAnnouncementAsRead: (id: string) => Promise<void>;

  activities: ActivityItem[];
  notifications: { id: string; title: string; time: string; read: boolean; type: string }[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  openBackendGuide: boolean;
  setOpenBackendGuide: (open: boolean) => void;
  resetDemoData: () => Promise<void>;

  isLoading: boolean;
  dbStatus: { connected: boolean; mode: string; mongoUriConfigured: boolean } | null;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('staffsync_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEMO_USERS.admin;
  });

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [openBackendGuide, setOpenBackendGuide] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string; mongoUriConfigured: boolean } | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | undefined>(undefined);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'Kwame Mensah requested 2 days Casual Leave', time: '10m ago', read: false, type: 'leave' },
    { id: 'notif-2', title: 'Open Enrollment policy published for 2027', time: '1h ago', read: false, type: 'announcement' },
    { id: 'notif-3', title: 'Weekly attendance report ready for download', time: '3h ago', read: true, type: 'system' }
  ]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('staffsync_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('staffsync_current_user');
    }
  }, [currentUser]);

  // Load all data from real backend REST APIs
  const refreshData = useCallback(async () => {
    try {
      // Fetch system status
      systemApi.getStatus().then((res) => {
        if (res?.system) {
          setDbStatus({
            connected: res.system.connected,
            mode: res.system.mode,
            mongoUriConfigured: res.system.mongoUriConfigured
          });
        }
      }).catch(() => {});

      // Parallel data fetching from Express API
      const [empRes, attRes, leaveRes, annRes, actRes, todayRes] = await Promise.allSettled([
        employeesApi.getAll(),
        attendanceApi.getAll(),
        leavesApi.getAll(),
        announcementsApi.getAll(),
        dashboardApi.getActivities(),
        attendanceApi.getToday()
      ]);

      if (empRes.status === 'fulfilled' && empRes.value.employees) {
        setEmployees(empRes.value.employees);
      }

      if (attRes.status === 'fulfilled' && attRes.value.attendance) {
        setAttendance(attRes.value.attendance);
      }

      if (leaveRes.status === 'fulfilled' && leaveRes.value.leaves) {
        setLeaveRequests(leaveRes.value.leaves);
      }

      if (annRes.status === 'fulfilled' && annRes.value.announcements) {
        setAnnouncements(annRes.value.announcements);
      }

      if (actRes.status === 'fulfilled' && actRes.value.activities) {
        setActivities(actRes.value.activities);
      }

      if (todayRes.status === 'fulfilled' && todayRes.value.record) {
        setTodayAttendance(todayRes.value.record);
      } else {
        setTodayAttendance(undefined);
      }
    } catch (err) {
      console.error('Error fetching backend data:', err);
    }
  }, []);

  // Initial load and token verification
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);

      const token = getStoredToken();
      if (token) {
        try {
          const me = await authApi.getMe();
          if (me.user) {
            setCurrentUser(me.user);
          }
        } catch (err) {
          // Token expired or invalid, auto-login with default admin demo token
          try {
            const loginRes = await authApi.login('sarah.jenkins@staffsync.internal', 'StaffSync2026!');
            if (loginRes.user) {
              setCurrentUser(loginRes.user);
            }
          } catch (e) {
            console.error('Default login fallback:', e);
          }
        }
      } else {
        // Automatically authenticate default demo session on first load
        try {
          const loginRes = await authApi.login('sarah.jenkins@staffsync.internal', 'StaffSync2026!');
          if (loginRes.user) {
            setCurrentUser(loginRes.user);
          }
        } catch (e) {
          console.error('Initial login fallback:', e);
        }
      }

      await refreshData();
      setIsLoading(false);
    };

    initApp();
  }, [refreshData]);

  // Auth: Role switcher
  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    const demoAccount = DEMO_USERS[role];
    if (!demoAccount) return;

    try {
      const res = await authApi.login(demoAccount.email, 'StaffSync2026!');
      setCurrentUser(res.user);
      showToast(`Switched active profile to ${res.user.name} (${res.user.role.toUpperCase()})`, 'info');
      await refreshData();
    } catch (err: any) {
      // If user doesn't exist in DB yet, try register or fallback
      try {
        const regRes = await authApi.register({
          name: demoAccount.name,
          email: demoAccount.email,
          password: 'StaffSync2026!',
          role: demoAccount.role,
          employeeId: demoAccount.employeeId,
          department: demoAccount.department,
          designation: demoAccount.designation,
          phone: demoAccount.phone
        });
        setCurrentUser(regRes.user);
        showToast(`Switched active profile to ${regRes.user.name} (${regRes.user.role.toUpperCase()})`, 'info');
        await refreshData();
      } catch (regErr: any) {
        setCurrentUser(demoAccount);
        showToast(`Active profile set to ${demoAccount.name}`, 'info');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAs = async (email: string, password = 'StaffSync2026!'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      setCurrentUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      await refreshData();
      setIsLoading(false);
      return true;
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
    setTodayAttendance(undefined);
    showToast('Signed out of StaffSync session.', 'info');
  };

  // Attendance: Check-In
  const userCheckIn = async (notes?: string) => {
    try {
      const res = await attendanceApi.checkIn(notes);
      setTodayAttendance(res.record);
      showToast(res.message || 'Checked in successfully!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to check in.', 'error');
    }
  };

  // Attendance: Check-Out
  const userCheckOut = async () => {
    try {
      const res = await attendanceApi.checkOut();
      setTodayAttendance(res.record);
      showToast(res.message || 'Checked out successfully!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to check out.', 'error');
    }
  };

  const addManualAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      const res = await attendanceApi.manualEntry(record);
      showToast(res.message || 'Attendance entry logged successfully.', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record attendance.', 'error');
    }
  };

  // Employee CRUD
  const addEmployee = async (emp: Omit<Employee, 'id'>) => {
    try {
      const res = await employeesApi.create(emp);
      showToast(res.message || `Employee ${emp.name} added successfully!`, 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add employee.', 'error');
    }
  };

  const updateEmployee = async (id: string, updated: Partial<Employee>) => {
    try {
      const res = await employeesApi.update(id, updated);
      showToast(res.message || 'Employee record updated successfully.', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update employee.', 'error');
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const res = await employeesApi.delete(id);
      showToast(res.message || 'Employee removed successfully.', 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete employee.', 'error');
    }
  };

  // Leaves
  const applyLeave = async (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    try {
      const res = await leavesApi.apply(leave);
      showToast(res.message || 'Leave application submitted for approval!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit leave application.', 'error');
    }
  };

  const reviewLeave = async (id: string, status: 'Approved' | 'Rejected', reviewNote?: string) => {
    try {
      const res = await leavesApi.review(id, status, reviewNote);
      showToast(res.message || `Leave request ${status.toLowerCase()}!`, status === 'Approved' ? 'success' : 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to review leave request.', 'error');
    }
  };

  // Announcements
  const addAnnouncement = async (ann: Omit<Announcement, 'id' | 'date' | 'readBy'>) => {
    try {
      const res = await announcementsApi.create(ann);
      showToast(res.message || 'Announcement published company-wide!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish announcement.', 'error');
    }
  };

  const markAnnouncementAsRead = async (id: string) => {
    try {
      await announcementsApi.markRead(id);
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === id && currentUser && !ann.readBy.includes(currentUser.employeeId)
            ? { ...ann, readBy: [...ann.readBy, currentUser.employeeId] }
            : ann
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Reset / Reseed Demo Data
  const resetDemoData = async () => {
    setIsLoading(true);
    try {
      await systemApi.seed();
      await switchDemoRole('admin');
      await refreshData();
      showToast('Database successfully reseeded with clean sample data.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reseed database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchDemoRole,
        loginAs,
        logout,
        currentPage,
        setCurrentPage,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        attendance,
        todayAttendance,
        userCheckIn,
        userCheckOut,
        addManualAttendance,
        leaveRequests,
        applyLeave,
        reviewLeave,
        announcements,
        addAnnouncement,
        markAnnouncementAsRead,
        activities,
        notifications,
        markNotificationRead,
        clearNotifications,
        toasts,
        showToast,
        dismissToast,
        openBackendGuide,
        setOpenBackendGuide,
        resetDemoData,
        isLoading,
        dbStatus,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
