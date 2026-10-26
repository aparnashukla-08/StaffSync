import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Database,
  Server,
  Key,
  Code2,
  Copy,
  Check,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';

export const BackendGuideModal: React.FC = () => {
  const { openBackendGuide, setOpenBackendGuide, showToast } = useApp();

  const [activeCodeTab, setActiveCodeTab] = useState<'server' | 'schema' | 'auth' | 'routes'>('server');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!openBackendGuide) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Code snippet copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const serverSnippet = `// server.js - Express.js backend for StaffSync HRMS
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import announcementRoutes from './routes/announcements.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/staffsync')
  .then(() => console.log('✓ Connected to MongoDB StaffSync Database'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'StaffSync HR API' }));

app.listen(PORT, () => {
  console.log(\`🚀 StaffSync Server running on http://localhost:\${PORT}\`);
});`;

  const schemaSnippet = `// models/Employee.js - Mongoose Schema
import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  designation: { type: String, required: true },
  department: { 
    type: String, 
    enum: ['Engineering', 'Product', 'Human Resources', 'Marketing', 'Sales', 'Finance'],
    required: true 
  },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  phone: { type: String, required: true },
  joinedDate: { type: Date, default: Date.now },
  salary: { type: Number, required: true },
  manager: { type: String, default: 'Executive Board' },
  workLocation: { type: String, default: 'San Francisco HQ' },
  address: { type: String },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  skills: [{ type: String }],
  avatar: { type: String }
}, { timestamps: true });

export const Employee = mongoose.model('Employee', EmployeeSchema);

// models/Attendance.js
const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, ref: 'Employee' },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  checkIn: { type: String },
  checkOut: { type: String },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'], default: 'Present' },
  workHours: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', AttendanceSchema);`;

  const authSnippet = `// middleware/auth.js - JWT Authentication & RBAC Middleware
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'staffsync_secret_jwt_key_2026');
    req.user = decoded; // { id, email, role, employeeId }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired session token' });
  }
};

// Role-based access control (RBAC) guard
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: \`Access denied. Requires one of roles: [\${roles.join(', ')}]\` 
      });
    }
    next();
  };
};`;

  const routesSnippet = `// routes/leaves.js - Leave Request Handlers
import express from 'express';
import { verifyToken, authorizeRoles } from '../middleware/auth.js';
import { LeaveRequest } from '../models/Leave.js';

const router = express.Router();

// GET all leaves (Filtered by employee if standard staff)
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'employee' ? { employeeId: req.user.employeeId } : {};
    const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new leave request
router.post('/', verifyToken, async (req, res) => {
  try {
    const newLeave = new LeaveRequest({
      ...req.body,
      employeeId: req.user.employeeId,
      status: 'Pending',
      appliedDate: new Date()
    });
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH review leave (Admin or Manager only)
router.patch('/:id/review', verifyToken, authorizeRoles('admin', 'manager'), async (req, res) => {
  const { status, reviewNote } = req.body;
  const leave = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    { status, reviewNote, reviewedBy: req.user.name, reviewDate: new Date() },
    { new: true }
  );
  res.json(leave);
});

export default router;`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Backend & Database Integration Blueprint</h3>
              <p className="text-xs text-slate-400">Node.js · Express.js · MongoDB (Mongoose) · JWT Auth</p>
            </div>
          </div>
          <button
            onClick={() => setOpenBackendGuide(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick instructions & Architecture */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <Server className="w-4 h-4 text-blue-600" />
                <span>1. Express REST API</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Connect your frontend API service calls to endpoints for auth, employees, and timesheets.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>2. MongoDB Atlas</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Persistent document store with indexed collections for employees, attendance, and leaves.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <Key className="w-4 h-4 text-amber-600" />
                <span>3. JWT & RBAC</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Stateless tokens with cryptographic role verification for admin, manager, and employee tiers.
              </p>
            </div>
          </div>

          {/* Quick install snippet */}
          <div className="bg-slate-900 rounded-lg p-3 text-slate-300 font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>npm install express mongoose dotenv jsonwebtoken bcryptjs cors</span>
            </div>
            <button
              onClick={() => handleCopy('npm install express mongoose dotenv jsonwebtoken bcryptjs cors', 'npm')}
              className="text-slate-400 hover:text-white p-1"
            >
              {copiedKey === 'npm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Code tabs */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 mb-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCodeTab('server')}
                  className={`px-3 py-1.5 font-semibold border-b-2 transition-colors ${
                    activeCodeTab === 'server'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  server.js
                </button>
                <button
                  onClick={() => setActiveCodeTab('schema')}
                  className={`px-3 py-1.5 font-semibold border-b-2 transition-colors ${
                    activeCodeTab === 'schema'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  models/Employee.js
                </button>
                <button
                  onClick={() => setActiveCodeTab('auth')}
                  className={`px-3 py-1.5 font-semibold border-b-2 transition-colors ${
                    activeCodeTab === 'auth'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  middleware/auth.js
                </button>
                <button
                  onClick={() => setActiveCodeTab('routes')}
                  className={`px-3 py-1.5 font-semibold border-b-2 transition-colors ${
                    activeCodeTab === 'routes'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  routes/leaves.js
                </button>
              </div>

              <button
                onClick={() => {
                  const map = {
                    server: serverSnippet,
                    schema: schemaSnippet,
                    auth: authSnippet,
                    routes: routesSnippet
                  };
                  handleCopy(map[activeCodeTab], activeCodeTab);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-semibold transition-colors"
              >
                {copiedKey === activeCodeTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === activeCodeTab ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="bg-slate-950 text-slate-200 rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-72 border border-slate-800">
              <pre>
                <code>
                  {activeCodeTab === 'server' && serverSnippet}
                  {activeCodeTab === 'schema' && schemaSnippet}
                  {activeCodeTab === 'auth' && authSnippet}
                  {activeCodeTab === 'routes' && routesSnippet}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            StaffSync is pre-structured for seamless Express/MongoDB hookup.
          </span>
          <button
            onClick={() => setOpenBackendGuide(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
