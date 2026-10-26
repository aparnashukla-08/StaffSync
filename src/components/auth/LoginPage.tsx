import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/mockData';
import { UserRole } from '../../types';
import { authApi } from '../../services/api';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Info,
  UserPlus,
  LogIn,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs, switchDemoRole, setCurrentPage, setCurrentUser, showToast, refreshData } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('sarah.jenkins@staffsync.internal');
  const [password, setPassword] = useState('StaffSync2026!');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: '',
    role: 'employee' as UserRole,
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '+1 (555) 019-2831'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your company email address');
      return;
    }
    if (!password) {
      setError('Please provide your account password');
      return;
    }

    setLoading(true);
    const success = await loginAs(email, password);
    setLoading(false);

    if (success) {
      setCurrentPage('dashboard');
    } else {
      setError('Invalid credentials or unseeded account. Please check credentials or pick a demo account.');
    }
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regData.name.trim() || !regData.email.trim() || !regData.employeeId.trim() || !regData.password) {
      setError('All marked fields are required for account creation');
      return;
    }

    if (regData.password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name: regData.name.trim(),
        email: regData.email.trim(),
        employeeId: regData.employeeId.trim(),
        password: regData.password,
        role: regData.role,
        department: regData.department,
        designation: regData.designation.trim() || 'Staff Member',
        phone: regData.phone
      });

      setCurrentUser(res.user);
      showToast(`Account created successfully! Welcome, ${res.user.name}.`, 'success');
      await refreshData();
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. The email or employee ID may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = async (role: UserRole) => {
    setLoading(true);
    await switchDemoRole(role);
    setLoading(false);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-md ring-4 ring-blue-50">
            <Building2 className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">StaffSync HRMS</h2>
          <p className="text-xs text-slate-500">
            Full-Stack Enterprise Human Resource Management (MERN Architecture)
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              // Suggest unique employee ID
              if (!regData.employeeId) {
                setRegData((prev) => ({
                  ...prev,
                  employeeId: `EMP-${Math.floor(1020 + Math.random() * 500)}`
                }));
              }
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Demo Authentication Notice */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block text-blue-950">
              Live MERN Backend & JWT Authentication
            </strong>
            Passwords are encrypted with <code className="font-mono bg-blue-100/70 px-1 py-0.2 rounded">bcrypt</code>. Authentication issues a signed <code className="font-mono bg-blue-100/70 px-1 py-0.2 rounded">JWT token</code> validated by Express middleware with role-based access control.
          </div>
        </div>

        {/* 1-Click Role Login Cards (Only in login mode) */}
        {mode === 'login' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instant 1-Click Preset Roles
              </span>
              <span className="text-[10px] text-slate-400">Seeds JWT automatically</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickRoleLogin('admin')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={DEMO_USERS.admin.avatar}
                    alt="Admin"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{DEMO_USERS.admin.name}</span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        HR Admin
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Full administrative & employee CRUD permissions</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickRoleLogin('manager')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={DEMO_USERS.manager.avatar}
                    alt="Manager"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{DEMO_USERS.manager.name}</span>
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        Manager
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Team oversight & leave approvals</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickRoleLogin('employee')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={DEMO_USERS.employee.avatar}
                    alt="Staff"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{DEMO_USERS.employee.name}</span>
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        Staff
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">Daily punch clock, leave applications, directory</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* Credentials Form (Login or Register) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          {mode === 'login' ? (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="name@staffsync.internal"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Demo password: <code className="font-mono">StaffSync2026!</code>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating with Server...' : 'Sign In with JWT'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCustomRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-1090"
                    value={regData.employeeId}
                    onChange={(e) => setRegData({ ...regData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@staffsync.internal"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={regData.department}
                    onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Permission</label>
                  <select
                    value={regData.role}
                    onChange={(e) => setRegData({ ...regData, role: e.target.value as UserRole })}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="employee">Standard Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">HR Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Engineer"
                  value={regData.designation}
                  onChange={(e) => setRegData({ ...regData, designation: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 6 chars) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Choose a strong password"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <span>{loading ? 'Creating Account in MongoDB...' : 'Register & Generate JWT'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-400">
          StaffSync MERN HRMS · MongoDB Atlas · Express.js · React.js · Node.js
        </div>
      </div>
    </div>
  );
};
