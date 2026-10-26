# StaffSync – Modern Human Resource Management System (MERN Stack)

StaffSync is an enterprise-grade, full-stack Human Resource Management System (HRMS) built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with TypeScript, Tailwind CSS, JSON Web Token (JWT) authentication, and bcrypt password encryption.

---

## 1. Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js (Modular REST API structure)
- **Database**: MongoDB Atlas using Mongoose ODM with schema constraints and compound indexes
- **Authentication**: Stateless JSON Web Tokens (JWT) with HMAC SHA-256 signing
- **Security**: bcrypt.js password hashing (10 salt rounds), Role-Based Access Control (RBAC) middleware, CORS protection, and input sanitization

---

## 2. Directory Structure

```text
├── server.ts                  # Express.js entry point mounting REST API and Vite middleware
├── server/
│   ├── db.ts                  # Mongoose MongoDB connection manager with auto-seed and fallback
│   ├── middleware/
│   │   └── auth.ts            # JWT token verification and requireRoles(...) RBAC middleware
│   ├── models/
│   │   ├── User.ts            # Mongoose schema for user accounts & auth
│   │   ├── Employee.ts        # Mongoose schema for staff records & compensation
│   │   ├── Attendance.ts      # Mongoose schema for check-in/out timesheets
│   │   ├── LeaveRequest.ts    # Mongoose schema for time-off applications
│   │   ├── Announcement.ts    # Mongoose schema for corporate news & bulletins
│   │   └── Activity.ts        # Mongoose schema for audit trail events
│   └── routes/
│       ├── auth.routes.ts     # Register, Login, Me, Profile update
│       ├── employee.routes.ts # Employee CRUD, search, department & status filter
│       ├── attendance.routes.ts # Daily punch-in/out, audit history, manual adjustments
│       ├── leave.routes.ts    # Apply leave, quota balances, admin review/approval
│       ├── announcement.routes.ts # Corporate bulletins & read tracking
│       ├── dashboard.routes.ts# Real aggregated workforce analytics & charts
│       └── system.routes.ts   # System health and database re-seed triggers
├── scripts/
│   └── seed.ts                # Standalone database seed script
├── src/
│   ├── components/            # UI components (Dashboard, Employees, Attendance, Leaves, etc.)
│   ├── context/
│   │   └── AppContext.tsx     # Global React context wired to real backend REST APIs
│   ├── services/
│   │   └── api.ts             # Typed API client with automatic JWT token attachment
│   ├── types/                 # Shared TypeScript interfaces
│   └── main.tsx               # Client entry point
├── .env.example               # Template for environment variables
└── README.md                  # Comprehensive setup & deployment documentation
```

---

## 3. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Either a local MongoDB instance (`mongodb://localhost:27017/staffsync`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

---

## 4. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
# MongoDB Atlas connection string
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/staffsync?retryWrites=true&w=majority"

# JWT Secret Key for signing authentication tokens
JWT_SECRET="staffsync_secure_production_jwt_secret_change_me"

# Application Port (defaults to 3000)
PORT=3000
```

> **Note on Zero-Downtime Sandbox Execution**: If `MONGODB_URI` is omitted or temporarily unreachable, StaffSync's dual-mode database engine automatically initializes a memory-synced repository. Every REST endpoint, bcrypt hashing, and JWT authorization continues to execute normally.

---

## 5. Installation & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Seed the Database (Optional)**:
   Populate MongoDB with standard demo employees, leave requests, attendance history, and corporate announcements:
   ```bash
   npm run seed
   ```

3. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build and Run for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 6. Pre-Configured Demo Accounts

All default test accounts share the demo password: `StaffSync2026!`

| Role | Name | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | Sarah Jenkins | `sarah.jenkins@staffsync.internal` | Full CRUD on employees, leave approvals, announcement posting, timesheet adjustments |
| **Manager** | David Miller | `david.miller@staffsync.internal` | Team timesheets, employee edit, leave review & approvals |
| **Staff Member** | Elena Rostova | `elena.rostova@staffsync.internal` | Clock in/out, personal leave applications, directory, profile |

*You can also register a brand new account with any custom name, role, and password via the **Register Account** tab on the login screen.*

---

## 7. Role-Based Access Control (RBAC) Matrix

Authorization is strictly enforced server-side using the `requireRoles(...)` Express middleware:

| Feature / Endpoint | Employee | Manager | HR Admin |
| :--- | :---: | :---: | :---: |
| **Punch In / Punch Out** (`POST /api/attendance/check-in`) | ✅ | ✅ | ✅ |
| **View Employee Directory** (`GET /api/employees`) | ✅ | ✅ | ✅ |
| **Apply for Leave** (`POST /api/leaves`) | ✅ | ✅ | ✅ |
| **Update Own Profile** (`PUT /api/auth/profile`) | ✅ | ✅ | ✅ |
| **Review / Approve Leaves** (`PATCH /api/leaves/:id/review`) | ❌ | ✅ | ✅ |
| **Manual Timesheet Adjustments** (`POST /api/attendance/manual`) | ❌ | ✅ | ✅ |
| **Create Announcements** (`POST /api/announcements`) | ❌ | ✅ | ✅ |
| **Add New Employee** (`POST /api/employees`) | ❌ | ❌ | ✅ |
| **Delete Employee** (`DELETE /api/employees/:id`) | ❌ | ❌ | ✅ |
| **Delete Announcements** (`DELETE /api/announcements/:id`) | ❌ | ❌ | ✅ |

---

## 8. REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register user account, hash password with bcrypt, issue JWT.
- `POST /api/auth/login`: Validate credentials, issue 7-day signed JWT token.
- `GET /api/auth/me`: Get current authenticated user profile (Bearer token required).
- `PUT /api/auth/profile`: Update self profile information (phone, address, bio, emergency contact).

### Employees (`/api/employees`)
- `GET /api/employees`: Search, department, and status-filtered list of employees.
- `GET /api/employees/:id`: Retrieve single employee dossier.
- `POST /api/employees`: Create employee (Admin only).
- `PUT /api/employees/:id`: Update employee details (Admin / Manager).
- `DELETE /api/employees/:id`: Remove employee record and user login (Admin only).

### Attendance (`/api/attendance`)
- `GET /api/attendance`: Filtered attendance records by date, department, or staff.
- `GET /api/attendance/today`: Today's punch record for authenticated user.
- `POST /api/attendance/check-in`: Record arrival timestamp (flags Late if after 9:15 AM).
- `POST /api/attendance/check-out`: Record departure and calculate worked hours.
- `POST /api/attendance/manual`: Log or adjust historical timesheet entry (Admin / Manager).

### Leave Management (`/api/leaves`)
- `GET /api/leaves`: Retrieve leaves (Employees see only their own; Managers/Admins see all).
- `GET /api/leaves/balance/:employeeId`: Calculate dynamic leave quota consumption.
- `POST /api/leaves`: Submit leave application with date validation and duration computation.
- `PATCH /api/leaves/:id/review`: Approve or reject leave with feedback note (Admin / Manager).

### Announcements (`/api/announcements`)
- `GET /api/announcements`: List published bulletins with category filtering.
- `POST /api/announcements`: Publish announcement (Admin / Manager).
- `PUT /api/announcements/:id`: Update announcement details (Admin / Manager).
- `DELETE /api/announcements/:id`: Delete bulletin (Admin only).
- `PATCH /api/announcements/:id/read`: Mark bulletin as read by authenticated employee.

### Dashboard & Analytics (`/api/dashboard`)
- `GET /api/dashboard/stats`: Aggregated workforce counts, live present rate, weekly trend.
- `GET /api/dashboard/activities`: Recent audit trail of company actions.

---

## 9. Deployment Guide

### A. MongoDB Atlas Database Setup
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster.
3. In **Database Access**, create a database user (e.g., `staffsync_admin`) with a strong password.
4. In **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) or your cloud host's IP.
5. Click **Connect** > **Drivers** > copy the connection string (format: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/staffsync?retryWrites=true&w=majority`).

### B. Deploying to Cloud Hosts (Render / Railway / Heroku / Cloud Run)
1. Push your repository to GitHub.
2. In your cloud hosting provider:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js` or `npm run start`
3. Configure the **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A long random secret string.
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (or host-assigned port).
4. Run the database seed once in your deployed console:
   ```bash
   npm run seed
   ```
