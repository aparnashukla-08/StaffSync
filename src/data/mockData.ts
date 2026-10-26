import { Employee, AttendanceRecord, LeaveRequest, Announcement, ActivityItem, User } from '../types';

export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'usr-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@staffsync.internal',
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
  manager: {
    id: 'usr-2',
    name: 'David Miller',
    email: 'david.miller@staffsync.internal',
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
  employee: {
    id: 'usr-3',
    name: 'Elena Rostova',
    email: 'elena.rostova@staffsync.internal',
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
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP-1001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@staffsync.internal',
    designation: 'Director of People & Culture',
    department: 'Human Resources',
    status: 'Active',
    phone: '+1 (555) 234-8901',
    joinedDate: '2021-03-15',
    salary: 145000,
    manager: 'Executive Board',
    workLocation: 'San Francisco HQ',
    address: '742 Evergreen Terrace, San Francisco, CA',
    emergencyContact: {
      name: 'Robert Jenkins',
      relationship: 'Spouse',
      phone: '+1 (555) 234-8909'
    },
    skills: ['Talent Strategy', 'People Analytics', 'Compensation', 'Culture'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-2',
    employeeId: 'EMP-1002',
    name: 'Marcus Vance',
    email: 'marcus.vance@staffsync.internal',
    designation: 'Staff Backend Architect',
    department: 'Engineering',
    status: 'Active',
    phone: '+1 (555) 456-7890',
    joinedDate: '2020-08-01',
    salary: 175000,
    manager: 'David Miller',
    workLocation: 'Remote (US East)',
    address: '15 Brooklyn Way, New York, NY',
    emergencyContact: {
      name: 'Alicia Vance',
      relationship: 'Sister',
      phone: '+1 (555) 456-7899'
    },
    skills: ['Go', 'Node.js', 'PostgreSQL', 'Distributed Systems', 'Kubernetes'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-3',
    employeeId: 'EMP-1003',
    name: 'Amara Chen',
    email: 'amara.chen@staffsync.internal',
    designation: 'Senior Frontend Engineer',
    department: 'Engineering',
    status: 'Active',
    phone: '+1 (555) 567-8901',
    joinedDate: '2022-04-12',
    salary: 138000,
    manager: 'David Miller',
    workLocation: 'San Francisco HQ',
    address: '88 Fremont St, San Francisco, CA',
    emergencyContact: {
      name: 'Li Chen',
      relationship: 'Parent',
      phone: '+1 (555) 567-8908'
    },
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Performance Optimization'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-4',
    employeeId: 'EMP-1004',
    name: 'David Miller',
    email: 'david.miller@staffsync.internal',
    designation: 'Engineering Lead',
    department: 'Engineering',
    status: 'Active',
    phone: '+1 (555) 345-6712',
    joinedDate: '2022-01-10',
    salary: 168000,
    manager: 'Sarah Jenkins',
    workLocation: 'San Francisco HQ',
    address: '128 Mission Blvd, Oakland, CA',
    emergencyContact: {
      name: 'Claire Miller',
      relationship: 'Spouse',
      phone: '+1 (555) 345-6718'
    },
    skills: ['Team Leadership', 'Agile Delivery', 'System Architecture', 'CI/CD'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-5',
    employeeId: 'EMP-1005',
    name: 'Priya Sharma',
    email: 'priya.sharma@staffsync.internal',
    designation: 'Head of Growth Marketing',
    department: 'Marketing',
    status: 'Active',
    phone: '+1 (555) 678-9012',
    joinedDate: '2021-11-05',
    salary: 142000,
    manager: 'Executive Board',
    workLocation: 'New York Hub',
    address: '320 West End Ave, New York, NY',
    emergencyContact: {
      name: 'Arun Sharma',
      relationship: 'Spouse',
      phone: '+1 (555) 678-9019'
    },
    skills: ['SEO/SEM', 'Brand Strategy', 'Product Launches', 'Funnel Analytics'],
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-6',
    employeeId: 'EMP-1006',
    name: 'Julian Hayes',
    email: 'julian.hayes@staffsync.internal',
    designation: 'Senior Financial Analyst',
    department: 'Finance',
    status: 'On Leave',
    phone: '+1 (555) 210-9876',
    joinedDate: '2022-07-18',
    salary: 118000,
    manager: 'Sarah Jenkins',
    workLocation: 'San Francisco HQ',
    address: '512 Pinecrest Way, San Mateo, CA',
    emergencyContact: {
      name: 'Rachel Hayes',
      relationship: 'Spouse',
      phone: '+1 (555) 210-9870'
    },
    skills: ['Financial Modeling', 'Budgeting', 'FP&A', 'SaaS Metrics'],
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-7',
    employeeId: 'EMP-1007',
    name: 'Elena Rostova',
    email: 'elena.rostova@staffsync.internal',
    designation: 'Senior Product Designer',
    department: 'Product',
    status: 'Active',
    phone: '+1 (555) 789-0123',
    joinedDate: '2023-05-20',
    salary: 132000,
    manager: 'Sarah Jenkins',
    workLocation: 'San Francisco HQ',
    address: '404 Market St, Apt 4B, San Francisco, CA',
    emergencyContact: {
      name: 'Victor Rostov',
      relationship: 'Brother',
      phone: '+1 (555) 789-0199'
    },
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-8',
    employeeId: 'EMP-1008',
    name: 'Kwame Mensah',
    email: 'kwame.mensah@staffsync.internal',
    designation: 'Senior Account Executive',
    department: 'Sales',
    status: 'Active',
    phone: '+1 (555) 890-1234',
    joinedDate: '2022-09-01',
    salary: 125000,
    manager: 'Sarah Jenkins',
    workLocation: 'Chicago Hub',
    address: '900 Michigan Ave, Chicago, IL',
    emergencyContact: {
      name: 'Kofi Mensah',
      relationship: 'Brother',
      phone: '+1 (555) 890-1230'
    },
    skills: ['Enterprise SaaS', 'Contract Negotiation', 'Discovery', 'Pipeline Gen'],
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-9',
    employeeId: 'EMP-1009',
    name: 'Zoe Nakamura',
    email: 'zoe.nakamura@staffsync.internal',
    designation: 'HR Operations Specialist',
    department: 'Human Resources',
    status: 'Active',
    phone: '+1 (555) 901-2345',
    joinedDate: '2023-02-14',
    salary: 88000,
    manager: 'Sarah Jenkins',
    workLocation: 'San Francisco HQ',
    address: '674 Post St, San Francisco, CA',
    emergencyContact: {
      name: 'Kenji Nakamura',
      relationship: 'Father',
      phone: '+1 (555) 901-2349'
    },
    skills: ['Onboarding', 'Benefits Administration', 'HRIS', 'Immigration'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-10',
    employeeId: 'EMP-1010',
    name: 'Carlos Santana',
    email: 'carlos.santana@staffsync.internal',
    designation: 'Cloud Infrastructure Engineer',
    department: 'Engineering',
    status: 'Active',
    phone: '+1 (555) 012-3456',
    joinedDate: '2023-08-11',
    salary: 135000,
    manager: 'David Miller',
    workLocation: 'Remote (US West)',
    address: '420 Broadway, Seattle, WA',
    emergencyContact: {
      name: 'Maria Santana',
      relationship: 'Mother',
      phone: '+1 (555) 012-3450'
    },
    skills: ['AWS', 'Terraform', 'Observability', 'Linux', 'Docker'],
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-11',
    employeeId: 'EMP-1011',
    name: 'Beatrice Webb',
    email: 'beatrice.webb@staffsync.internal',
    designation: 'Lead Product Manager',
    department: 'Product',
    status: 'Active',
    phone: '+1 (555) 123-4567',
    joinedDate: '2021-06-22',
    salary: 152000,
    manager: 'Executive Board',
    workLocation: 'San Francisco HQ',
    address: '150 California St, San Francisco, CA',
    emergencyContact: {
      name: 'Thomas Webb',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4560'
    },
    skills: ['Roadmap Execution', 'Customer Discovery', 'Cross-functional Ops', 'Data Analysis'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80'
  },
  {
    id: 'emp-12',
    employeeId: 'EMP-1012',
    name: 'Liam O’Connor',
    email: 'liam.oconnor@staffsync.internal',
    designation: 'Customer Success Manager',
    department: 'Sales',
    status: 'Inactive',
    phone: '+1 (555) 234-5678',
    joinedDate: '2022-03-01',
    salary: 95000,
    manager: 'Sarah Jenkins',
    workLocation: 'New York Hub',
    address: '77 Fifth Ave, New York, NY',
    emergencyContact: {
      name: 'Siobhan O’Connor',
      relationship: 'Sister',
      phone: '+1 (555) 234-5670'
    },
    skills: ['Customer Retention', 'Account Health', 'Executive Business Reviews'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Jenkins',
    department: 'Human Resources',
    date: '2026-10-25',
    checkIn: '08:55 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.2,
    notes: 'On premise - HQ Room 3B'
  },
  {
    id: 'att-2',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    department: 'Engineering',
    date: '2026-10-25',
    checkIn: '09:02 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.1,
    notes: 'Remote NY'
  },
  {
    id: 'att-3',
    employeeId: 'EMP-1003',
    employeeName: 'Amara Chen',
    department: 'Engineering',
    date: '2026-10-25',
    checkIn: '09:42 AM',
    checkOut: null,
    status: 'Late',
    workHours: 6.4,
    notes: 'Transit delay'
  },
  {
    id: 'att-4',
    employeeId: 'EMP-1004',
    employeeName: 'David Miller',
    department: 'Engineering',
    date: '2026-10-25',
    checkIn: '08:48 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.3,
    notes: 'On premise'
  },
  {
    id: 'att-5',
    employeeId: 'EMP-1005',
    employeeName: 'Priya Sharma',
    department: 'Marketing',
    date: '2026-10-25',
    checkIn: '09:00 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.1,
    notes: 'Remote NY'
  },
  {
    id: 'att-6',
    employeeId: 'EMP-1006',
    employeeName: 'Julian Hayes',
    department: 'Finance',
    date: '2026-10-25',
    checkIn: null,
    checkOut: null,
    status: 'Absent',
    workHours: 0,
    notes: 'Approved medical leave'
  },
  {
    id: 'att-7',
    employeeId: 'EMP-1007',
    employeeName: 'Elena Rostova',
    department: 'Product',
    date: '2026-10-25',
    checkIn: '09:10 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.0,
    notes: 'Design sprint on premise'
  },
  {
    id: 'att-8',
    employeeId: 'EMP-1008',
    employeeName: 'Kwame Mensah',
    department: 'Sales',
    date: '2026-10-25',
    checkIn: '08:30 AM',
    checkOut: '01:00 PM',
    status: 'Half Day',
    workHours: 4.5,
    notes: 'Client onsite afternoon'
  },
  {
    id: 'att-9',
    employeeId: 'EMP-1009',
    employeeName: 'Zoe Nakamura',
    department: 'Human Resources',
    date: '2026-10-25',
    checkIn: '08:58 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.2,
    notes: 'On premise'
  },
  {
    id: 'att-10',
    employeeId: 'EMP-1010',
    employeeName: 'Carlos Santana',
    department: 'Engineering',
    date: '2026-10-25',
    checkIn: '09:05 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.1,
    notes: 'Remote WA'
  },
  {
    id: 'att-11',
    employeeId: 'EMP-1011',
    employeeName: 'Beatrice Webb',
    department: 'Product',
    date: '2026-10-25',
    checkIn: '08:50 AM',
    checkOut: null,
    status: 'Present',
    workHours: 7.3,
    notes: 'On premise'
  },
  // Yesterday's historical data
  {
    id: 'att-12',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Jenkins',
    department: 'Human Resources',
    date: '2026-10-24',
    checkIn: '08:50 AM',
    checkOut: '05:30 PM',
    status: 'Present',
    workHours: 8.6,
    notes: 'Regular day'
  },
  {
    id: 'att-13',
    employeeId: 'EMP-1004',
    employeeName: 'David Miller',
    department: 'Engineering',
    date: '2026-10-24',
    checkIn: '09:00 AM',
    checkOut: '06:15 PM',
    status: 'Present',
    workHours: 9.2,
    notes: 'Sprint planning'
  },
  {
    id: 'att-14',
    employeeId: 'EMP-1007',
    employeeName: 'Elena Rostova',
    department: 'Product',
    date: '2026-10-24',
    checkIn: '09:05 AM',
    checkOut: '05:45 PM',
    status: 'Present',
    workHours: 8.6,
    notes: 'User testing'
  }
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'lv-101',
    employeeId: 'EMP-1006',
    employeeName: 'Julian Hayes',
    department: 'Finance',
    leaveType: 'Sick',
    startDate: '2026-10-24',
    endDate: '2026-10-27',
    days: 4,
    reason: 'Undergoing routine minor dental surgery and recovery.',
    status: 'Approved',
    appliedDate: '2026-10-20',
    reviewedBy: 'Sarah Jenkins (HR Director)',
    reviewDate: '2026-10-21',
    reviewNote: 'Approved. Get well soon Julian!',
    emergencyPhone: '+1 (555) 210-9870'
  },
  {
    id: 'lv-102',
    employeeId: 'EMP-1003',
    employeeName: 'Amara Chen',
    department: 'Engineering',
    leaveType: 'Annual',
    startDate: '2026-11-10',
    endDate: '2026-11-17',
    days: 6,
    reason: 'Family reunion trip overseas. Marcus and Carlos will cover pull requests.',
    status: 'Pending',
    appliedDate: '2026-10-24',
    emergencyPhone: '+1 (555) 567-8908'
  },
  {
    id: 'lv-103',
    employeeId: 'EMP-1008',
    employeeName: 'Kwame Mensah',
    department: 'Sales',
    leaveType: 'Casual',
    startDate: '2026-10-28',
    endDate: '2026-10-29',
    days: 2,
    reason: 'Relocating to new apartment, taking moving day off.',
    status: 'Pending',
    appliedDate: '2026-10-25',
    emergencyPhone: '+1 (555) 890-1230'
  },
  {
    id: 'lv-104',
    employeeId: 'EMP-1010',
    employeeName: 'Carlos Santana',
    department: 'Engineering',
    leaveType: 'Casual',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    days: 2,
    reason: 'Personal family event.',
    status: 'Approved',
    appliedDate: '2026-10-10',
    reviewedBy: 'David Miller (Lead)',
    reviewDate: '2026-10-11',
    reviewNote: 'Approved. Enjoy the weekend!',
    emergencyPhone: '+1 (555) 012-3450'
  },
  {
    id: 'lv-105',
    employeeId: 'EMP-1005',
    employeeName: 'Priya Sharma',
    department: 'Marketing',
    leaveType: 'Annual',
    startDate: '2026-10-02',
    endDate: '2026-10-06',
    days: 5,
    reason: 'Annual recharge break.',
    status: 'Approved',
    appliedDate: '2026-09-20',
    reviewedBy: 'Sarah Jenkins (HR Director)',
    reviewDate: '2026-09-22',
    reviewNote: 'Well deserved rest.',
    emergencyPhone: '+1 (555) 678-9019'
  },
  {
    id: 'lv-106',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Vance',
    department: 'Engineering',
    leaveType: 'Casual',
    startDate: '2026-09-18',
    endDate: '2026-09-19',
    days: 2,
    reason: 'Short notice personal matter during release week.',
    status: 'Rejected',
    appliedDate: '2026-09-17',
    reviewedBy: 'David Miller (Lead)',
    reviewDate: '2026-09-17',
    reviewNote: 'Critical production database migration scheduled on these days. Please reschedule after release.',
    emergencyPhone: '+1 (555) 456-7899'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'StaffSync Annual Benefits Open Enrollment 2027',
    content: 'Open enrollment for healthcare, dental, optical, and 401(k) matching opens next Monday. Please review the updated employee handbook in the HR portal and ensure your dependent elections are finalized before November 15th.',
    category: 'Policy',
    priority: 'Urgent',
    author: 'Sarah Jenkins',
    authorRole: 'Director of People & Culture',
    date: '2026-10-24',
    isPinned: true,
    readBy: ['EMP-1001', 'EMP-1004']
  },
  {
    id: 'ann-2',
    title: 'Q4 Company All-Hands & Product Roadmap Reveal',
    content: 'Join us this Thursday at 10:00 AM PST for our quarterly company-wide gathering. We will celebrate team milestones, review Q3 ARR growth, and preview our upcoming enterprise features with live Q&A.',
    category: 'Company',
    priority: 'High',
    author: 'Sarah Jenkins',
    authorRole: 'Director of People & Culture',
    date: '2026-10-23',
    isPinned: true,
    readBy: ['EMP-1001', 'EMP-1003', 'EMP-1004', 'EMP-1007']
  },
  {
    id: 'ann-3',
    title: 'Upcoming Public Holiday: Office Closure Notice',
    content: 'Please note that all regional offices and support queues will be closed on Tuesday, November 11th in observance of Veterans Day. Scheduled infrastructure changes will be paused.',
    category: 'Holiday',
    priority: 'Normal',
    author: 'Zoe Nakamura',
    authorRole: 'HR Operations Specialist',
    date: '2026-10-21',
    isPinned: false,
    readBy: ['EMP-1001']
  },
  {
    id: 'ann-4',
    title: 'Annual Team Hackathon: Register Your Squads',
    content: 'Calling all developers, designers, product managers, and marketers! Registration for our 48-hour Autumn Innovation Sprint is officially open. Exciting customer problem statements and prizes await!',
    category: 'Event',
    priority: 'Normal',
    author: 'David Miller',
    authorRole: 'Engineering Lead',
    date: '2026-10-18',
    isPinned: false,
    readBy: ['EMP-1001', 'EMP-1002', 'EMP-1004']
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'leave_applied',
    title: 'New Leave Request',
    description: 'Kwame Mensah requested 2 days of Casual Leave',
    timestamp: '15 minutes ago',
    actor: 'Kwame Mensah'
  },
  {
    id: 'act-2',
    type: 'check_in',
    title: 'Late Arrival Recorded',
    description: 'Amara Chen checked in at 09:42 AM (Transit delay)',
    timestamp: '42 minutes ago',
    actor: 'Amara Chen'
  },
  {
    id: 'act-3',
    type: 'leave_applied',
    title: 'New Leave Request',
    description: 'Amara Chen requested 6 days of Annual Leave',
    timestamp: '2 hours ago',
    actor: 'Amara Chen'
  },
  {
    id: 'act-4',
    type: 'announcement',
    title: 'Announcement Published',
    description: 'Annual Benefits Open Enrollment 2027 notice posted',
    timestamp: 'Yesterday at 4:30 PM',
    actor: 'Sarah Jenkins'
  },
  {
    id: 'act-5',
    type: 'leave_approved',
    title: 'Leave Approved',
    description: 'Julian Hayes medical leave request was approved',
    timestamp: '2 days ago',
    actor: 'Sarah Jenkins'
  }
];

export const MOCK_LEAVE_BALANCES: Record<string, { annual: { used: number; total: number }; sick: { used: number; total: number }; casual: { used: number; total: number }; unpaid: { used: number; total: number } }> = {
  'EMP-1001': {
    annual: { used: 4, total: 20 },
    sick: { used: 2, total: 12 },
    casual: { used: 1, total: 6 },
    unpaid: { used: 0, total: 10 }
  },
  'EMP-1004': {
    annual: { used: 7, total: 20 },
    sick: { used: 1, total: 12 },
    casual: { used: 2, total: 6 },
    unpaid: { used: 0, total: 10 }
  },
  'EMP-1007': {
    annual: { used: 5, total: 18 },
    sick: { used: 3, total: 10 },
    casual: { used: 1, total: 6 },
    unpaid: { used: 0, total: 10 }
  }
};
