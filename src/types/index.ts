export type UserRole = 'admin' | 'manager' | 'employee';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';

export type AnnouncementCategory = 'Company' | 'Policy' | 'Event' | 'Holiday' | 'Alert';

export type AnnouncementPriority = 'Normal' | 'High' | 'Urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  designation: string;
  department: string;
  avatar: string;
  phone: string;
  address: string;
  joinedDate: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bio: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  status: EmployeeStatus;
  phone: string;
  joinedDate: string;
  salary: number;
  manager: string;
  workLocation: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  skills: string[];
  avatar: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm AM/PM
  checkOut: string | null;
  status: AttendanceStatus;
  workHours: number; // e.g., 8.5
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNote?: string;
  emergencyPhone?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  author: string;
  authorRole: string;
  date: string;
  isPinned: boolean;
  readBy: string[]; // employeeIds
}

export interface ActivityItem {
  id: string;
  type: 'check_in' | 'leave_applied' | 'leave_approved' | 'leave_rejected' | 'employee_added' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface LeaveBalance {
  annual: { used: number; total: number };
  sick: { used: number; total: number };
  casual: { used: number; total: number };
  unpaid: { used: number; total: number };
}
