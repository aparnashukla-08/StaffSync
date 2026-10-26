import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel, IUser } from './models/User';
import { EmployeeModel, IEmployee } from './models/Employee';
import { AttendanceModel, IAttendance } from './models/Attendance';
import { LeaveRequestModel, ILeaveRequest } from './models/LeaveRequest';
import { AnnouncementModel, IAnnouncement } from './models/Announcement';
import { ActivityModel, IActivity } from './models/Activity';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITIES
} from '../src/data/mockData';

let isMongooseConnected = false;

// In-memory fallback collections for zero-downtime execution in sandboxes
export const memoryStore = {
  users: [] as any[],
  employees: [] as any[],
  attendance: [] as any[],
  leaves: [] as any[],
  announcements: [] as any[],
  activities: [] as any[]
};

export const isDbConnected = () => isMongooseConnected;

export const getDbStatus = () => {
  return {
    connected: isMongooseConnected,
    mode: isMongooseConnected ? 'MongoDB Atlas' : 'In-Memory Fallback Store',
    mongoUriConfigured: Boolean(process.env.MONGODB_URI),
    counts: {
      users: isMongooseConnected ? undefined : memoryStore.users.length,
      employees: isMongooseConnected ? undefined : memoryStore.employees.length,
      attendance: isMongooseConnected ? undefined : memoryStore.attendance.length,
      leaves: isMongooseConnected ? undefined : memoryStore.leaves.length,
      announcements: isMongooseConnected ? undefined : memoryStore.announcements.length
    }
  };
};

export async function seedInitialData(force = false) {
  const defaultPasswordHash = await bcrypt.hash('StaffSync2026!', 10);

  const defaultUsers = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@staffsync.internal',
      password: defaultPasswordHash,
      role: 'admin',
      employeeId: 'EMP-1001',
      designation: 'Director of People & Culture',
      department: 'Human Resources',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+1 (555) 234-8901',
      address: '742 Evergreen Terrace, San Francisco, CA',
      joinedDate: '2021-03-15',
      emergencyContact: {
        name: 'Robert Jenkins',
        relationship: 'Spouse',
        phone: '+1 (555) 234-8909'
      },
      bio: 'Dedicated HR leader with 10+ years scaling high-performing organizational culture, talent development, and transparent employee experience.'
    },
    {
      name: 'David Miller',
      email: 'david.miller@staffsync.internal',
      password: defaultPasswordHash,
      role: 'manager',
      employeeId: 'EMP-1004',
      designation: 'Engineering Lead',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+1 (555) 345-6712',
      address: '128 Mission Blvd, Oakland, CA',
      joinedDate: '2022-01-10',
      emergencyContact: {
        name: 'Claire Miller',
        relationship: 'Spouse',
        phone: '+1 (555) 345-6718'
      },
      bio: 'Engineering manager passionate about scalable systems, empathetic mentorship, and building joyful, resilient developer workflows.'
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@staffsync.internal',
      password: defaultPasswordHash,
      role: 'employee',
      employeeId: 'EMP-1007',
      designation: 'Senior Product Designer',
      department: 'Product',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      phone: '+1 (555) 789-0123',
      address: '404 Market St, Apt 4B, San Francisco, CA',
      joinedDate: '2023-05-20',
      emergencyContact: {
        name: 'Victor Rostov',
        relationship: 'Brother',
        phone: '+1 (555) 789-0199'
      },
      bio: 'Product designer obsessed with high-craft interfaces, cognitive clarity, design systems, and seamless enterprise user journeys.'
    }
  ];

  if (isMongooseConnected) {
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0 || force) {
        if (force) {
          await UserModel.deleteMany({});
          await EmployeeModel.deleteMany({});
          await AttendanceModel.deleteMany({});
          await LeaveRequestModel.deleteMany({});
          await AnnouncementModel.deleteMany({});
          await ActivityModel.deleteMany({});
        }

        await UserModel.insertMany(defaultUsers);
        await EmployeeModel.insertMany(INITIAL_EMPLOYEES);
        await AttendanceModel.insertMany(INITIAL_ATTENDANCE);
        await LeaveRequestModel.insertMany(INITIAL_LEAVES);
        await AnnouncementModel.insertMany(INITIAL_ANNOUNCEMENTS);
        await ActivityModel.insertMany(INITIAL_ACTIVITIES);
        console.log('✓ MongoDB database seeded with initial StaffSync HR records.');
      }
    } catch (err) {
      console.error('Error during MongoDB seed:', err);
    }
  }

  // Always seed memoryStore as well
  if (memoryStore.users.length === 0 || force) {
    memoryStore.users = defaultUsers.map((u, i) => ({ ...u, _id: `usr_${i + 1}`, id: `usr_${i + 1}` }));
    memoryStore.employees = INITIAL_EMPLOYEES.map((e) => ({ ...e, _id: e.id }));
    memoryStore.attendance = INITIAL_ATTENDANCE.map((a) => ({ ...a, _id: a.id }));
    memoryStore.leaves = INITIAL_LEAVES.map((l) => ({ ...l, _id: l.id }));
    memoryStore.announcements = INITIAL_ANNOUNCEMENTS.map((a) => ({ ...a, _id: a.id }));
    memoryStore.activities = INITIAL_ACTIVITIES.map((act) => ({ ...act, _id: act.id }));
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️ MONGODB_URI not detected in environment. Initializing in-memory fallback store.');
    await seedInitialData();
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    // Timeout quickly if URI is unreachable so server startup is not blocked
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });
    isMongooseConnected = true;
    console.log('✓ Successfully connected to MongoDB Atlas via Mongoose.');
    await seedInitialData();
  } catch (error: any) {
    console.warn(`⚠️ Could not connect to MongoDB Atlas (${error.message}). Falling back to memory-synced repository.`);
    isMongooseConnected = false;
    await seedInitialData();
  }
}
