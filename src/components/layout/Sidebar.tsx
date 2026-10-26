import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Contact,
  Megaphone,
  UserCircle,
  Database,
  ShieldCheck,
  ChevronRight,
  LogOut,
  RefreshCw,
  Building2,
  X
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    switchDemoRole,
    logout,
    resetDemoData,
    leaveRequests,
    announcements,
    setOpenBackendGuide
  } = useApp();

  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'Pending').length;
  const unreadAnnouncements = announcements.filter(
    (a) => currentUser && !a.readBy.includes(currentUser.employeeId)
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      badge: null
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Clock,
      badge: null
    },
    {
      id: 'leaves',
      label: 'Leave Management',
      icon: CalendarDays,
      badge: pendingLeavesCount > 0 ? `${pendingLeavesCount}` : null
    },
    {
      id: 'directory',
      label: 'Employee Directory',
      icon: Contact,
      badge: null
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : null
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: UserCircle,
      badge: null
    }
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-base shadow-sm ring-1 ring-blue-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">StaffSync</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.2 rounded">
                  HRMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px]">Enterprise Portal</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Role Switcher Quick Bar */}
        <div className="px-4 py-3 border-b border-slate-800/70 bg-slate-950/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Demo Role
            </span>
            <span className="text-[10px] text-slate-400">Click to switch</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/50 text-[11px] font-medium text-center">
            <button
              onClick={() => switchDemoRole('admin')}
              className={`py-1 rounded transition-colors ${
                currentUser?.role === 'admin'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="HR Administrator"
            >
              Admin
            </button>
            <button
              onClick={() => switchDemoRole('manager')}
              className={`py-1 rounded transition-colors ${
                currentUser?.role === 'manager'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Engineering Lead"
            >
              Manager
            </button>
            <button
              onClick={() => switchDemoRole('employee')}
              className={`py-1 rounded transition-colors ${
                currentUser?.role === 'employee'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Product Designer"
            >
              Staff
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Architecture
          </div>

          {/* Backend guide trigger button */}
          <button
            onClick={() => {
              setOpenBackendGuide(true);
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
              <span>Full-Stack Integration</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-1.5 py-0.5 rounded">
              Node & Mongo
            </span>
          </button>
        </nav>

        {/* Bottom user profile & session actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          {currentUser ? (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.designation}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                title="Sign out of demo"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentPage('login')}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Sign In to Demo
            </button>
          )}

          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>MERN Active</span>
            </span>
            <button
              onClick={resetDemoData}
              className="flex items-center gap-1 hover:text-slate-200 transition-colors"
              title="Reseed MongoDB database with initial sample data"
            >
              <RefreshCw className="w-3 h-3" />
              Reseed DB
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
