import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Search,
  Bell,
  Clock,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Code2,
  Check,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';

interface TopNavbarProps {
  onToggleMobileSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    currentPage,
    setCurrentPage,
    todayAttendance,
    userCheckIn,
    userCheckOut,
    employees,
    announcements,
    notifications,
    markNotificationRead,
    clearNotifications,
    logout,
    setOpenBackendGuide
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Filtered search results
  const filteredEmployees = searchQuery.trim()
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredAnnouncements = searchQuery.trim()
    ? announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  // Breadcrumbs title lookup
  const pageTitles: Record<string, string> = {
    dashboard: 'HR Overview & Analytics',
    employees: 'Employee Management',
    attendance: 'Daily Attendance & Timesheets',
    leaves: 'Leave Applications & Approvals',
    directory: 'Employee Directory',
    announcements: 'Company Announcements & Notices',
    profile: 'My Employee Profile',
    login: 'Demo Authentication'
  };

  const handleSelectEmployee = (empId: string) => {
    setCurrentPage('employees');
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleSelectAnnouncement = () => {
    setCurrentPage('announcements');
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 gap-4">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs text-slate-400 font-medium tracking-tight">StaffSync Workspace</span>
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              {pageTitles[currentPage] || 'Overview'}
            </h1>
          </div>
        </div>

        {/* Center: Global search */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search employees, roles, announcements..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Modal */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 text-xs">
              <div className="p-2 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                Search Results for &ldquo;{searchQuery}&rdquo;
              </div>

              {filteredEmployees.length === 0 && filteredAnnouncements.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No matching employees or announcements found.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {filteredEmployees.length > 0 && (
                    <div className="p-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Employees ({filteredEmployees.length})
                      </div>
                      {filteredEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => handleSelectEmployee(emp.id)}
                          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                        >
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 truncate">{emp.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {emp.designation} · {emp.department}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {emp.employeeId}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredAnnouncements.length > 0 && (
                    <div className="p-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Announcements
                      </div>
                      {filteredAnnouncements.map((ann) => (
                        <button
                          key={ann.id}
                          onClick={handleSelectAnnouncement}
                          className="w-full p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                        >
                          <p className="font-semibold text-slate-800 truncate">{ann.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{ann.content}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Real Backend / Database Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MERN Stack</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold font-mono text-[10px]">
              REST / JWT
            </span>
          </div>

          {/* Quick Check-In / Check-Out badge */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {todayAttendance?.checkIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">
                    In: <strong className="font-semibold text-slate-900 tabular-nums">{todayAttendance.checkIn}</strong>
                  </span>
                  {!todayAttendance.checkOut ? (
                    <button
                      onClick={userCheckOut}
                      className="px-2 py-0.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors whitespace-nowrap"
                    >
                      Punch Out
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Checked Out</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => userCheckIn()}
                  className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors whitespace-nowrap"
                >
                  Punch In Today
                </button>
              )}
            </div>
          )}

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-slate-800 ${!notif.read ? 'font-semibold' : ''}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block tabular-nums">
                        {notif.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative" ref={userMenuRef}>
            {currentUser ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 border border-slate-200/80 transition-colors"
                aria-label="User profile menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage('login')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50"
              >
                Sign In
              </button>
            )}

            {showUserMenu && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1.5 inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    {currentUser.role}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setOpenBackendGuide(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    <span>Backend Guide</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
