import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { UserModel } from '../server/models/User';
import { EmployeeModel } from '../server/models/Employee';
import { AttendanceModel } from '../server/models/Attendance';
import { LeaveRequestModel } from '../server/models/LeaveRequest';
import { AnnouncementModel } from '../server/models/Announcement';
import { ActivityModel } from '../server/models/Activity';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITIES
} from '../src/data/mockData';

dotenv.config();

async function runSeed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/staffsync';
  console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/.*@/, '//***:***@')} ...`);

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB database.');

    console.log('Clearing old StaffSync records...');
    await Promise.all([
      UserModel.deleteMany({}),
      EmployeeModel.deleteMany({}),
      AttendanceModel.deleteMany({}),
      LeaveRequestModel.deleteMany({}),
      AnnouncementModel.deleteMany({}),
      ActivityModel.deleteMany({})
    ]);

    const defaultPasswordHash = await bcrypt.hash('StaffSync2026!', 10);

    const users = [
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

    console.log(`Seeding ${users.length} authenticated users...`);
    await UserModel.insertMany(users);

    console.log(`Seeding ${INITIAL_EMPLOYEES.length} personnel records...`);
    await EmployeeModel.insertMany(INITIAL_EMPLOYEES);

    console.log(`Seeding ${INITIAL_ATTENDANCE.length} attendance timesheets...`);
    await AttendanceModel.insertMany(INITIAL_ATTENDANCE);

    console.log(`Seeding ${INITIAL_LEAVES.length} leave requests...`);
    await LeaveRequestModel.insertMany(INITIAL_LEAVES);

    console.log(`Seeding ${INITIAL_ANNOUNCEMENTS.length} announcements...`);
    await AnnouncementModel.insertMany(INITIAL_ANNOUNCEMENTS);

    console.log(`Seeding ${INITIAL_ACTIVITIES.length} activity audit log items...`);
    await ActivityModel.insertMany(INITIAL_ACTIVITIES);

    console.log('\n=========================================');
    console.log('✓ StaffSync Database Seed Completed Successfully!');
    console.log('Default Demo Accounts created:');
    console.log('1. Admin (HR):   sarah.jenkins@staffsync.internal / StaffSync2026!');
    console.log('2. Manager:      david.miller@staffsync.internal  / StaffSync2026!');
    console.log('3. Staff:        elena.rostova@staffsync.internal / StaffSync2026!');
    console.log('=========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed script failed:', err);
    process.exit(1);
  }
}

runSeed();
