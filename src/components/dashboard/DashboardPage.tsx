import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarDays,
  Megaphone,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  FileText,
  Building,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface DashboardPageProps {
  onOpenAddEmployee?: () => void;
  onOpenApplyLeave?: () => void;
  onOpenNewAnnouncement?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddEmployee,
  onOpenApplyLeave,
  onOpenNewAnnouncement
}) => {
  const {
    employees,
    attendance,
    leaveRequests,
    announcements,
    activities,
    currentUser,
    setCurrentPage,
    todayAttendance,
    userCheckIn,
    userCheckOut
  } = useApp();

  const [activeChartDay, setActiveChartDay] = useState<number | null>(4); // default to Friday

  // Calculated metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((a) => a.date === todayStr);

  const presentCount = todayRecords.filter(
    (a) => a.status === 'Present' || a.status === 'Late' || a.status === 'Half Day'
  ).length;

  // Employees absent = total active employees - present count
  const absentCount = Math.max(0, activeEmployees - presentCount);

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;

  // Department attendance stats
  const departments = ['Engineering', 'Product', 'Human Resources', 'Marketing', 'Sales', 'Finance'];
  const departmentStats = departments.map((dept) => {
    const deptEmployees = employees.filter((e) => e.department === dept && e.status === 'Active');
    const deptPresent = deptEmployees.filter((emp) =>
      todayRecords.some(
        (r) =>
          r.employeeId === emp.employeeId &&
          (r.status === 'Present' || r.status === 'Late' || r.status === 'Half Day')
      )
    ).length;
    const rate = deptEmployees.length > 0 ? Math.round((deptPresent / deptEmployees.length) * 100) : 0;
    return {
      department: dept,
      total: deptEmployees.length,
      present: deptPresent,
      rate
    };
  });

  // Weekly attendance simulation data for chart
  const weeklyTrend = [
    { day: 'Mon', date: 'Oct 20', rate: 94, present: 11, total: 12 },
    { day: 'Tue', date: 'Oct 21', rate: 92, present: 11, total: 12 },
    { day: 'Wed', date: 'Oct 22', rate: 100, present: 12, total: 12 },
    { day: 'Thu', date: 'Oct 23', rate: 92, present: 11, total: 12 },
    { day: 'Fri', date: 'Oct 24', rate: 85, present: 10, total: 12 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {currentUser?.name || 'Administrator'}
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              StaffSync Live Portal · Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {todayAttendance?.checkIn ? (
              !todayAttendance.checkOut ? (
                <button
                  onClick={userCheckOut}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Clock Out ({todayAttendance.checkIn})
                </button>
              ) : (
                <div className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Shift Completed
                </div>
              )
            ) : (
              <button
                onClick={() => userCheckIn()}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Clock In Today
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenApplyLeave) onOpenApplyLeave();
                else setCurrentPage('leaves');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5 text-slate-600" />
              Apply Leave
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  if (onOpenAddEmployee) onOpenAddEmployee();
                  else setCurrentPage('employees');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                Add Employee
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Primary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div
          onClick={() => setCurrentPage('employees')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Workforce
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {totalEmployees}
            </span>
            <span className="text-xs text-slate-500">
              ({activeEmployees} active)
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>6 Departments</span>
            <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Present Today */}
        <div
          onClick={() => setCurrentPage('attendance')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {presentCount}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {activeEmployees > 0 ? Math.round((presentCount / activeEmployees) * 100) : 0}% turn-out
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Logged on premise & remote</span>
            <span className="text-emerald-700 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5">
              Timesheet <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Absent Today */}
        <div
          onClick={() => setCurrentPage('attendance')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Absent Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {absentCount}
            </span>
            <span className="text-xs text-slate-500">
              {absentCount === 1 ? '1 on scheduled leave' : `${absentCount} on leave/absent`}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Julian Hayes (Sick Leave)</span>
            <span className="text-amber-700 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5">
              View Log <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div
          onClick={() => setCurrentPage('leaves')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Leaves
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {pendingLeaves}
            </span>
            {pendingLeaves > 0 && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Action Required
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{currentUser?.role === 'employee' ? 'My & team requests' : 'Pending manager review'}</span>
            <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5">
              Review <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Attendance Analytics & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Attendance Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily participation rates across all 6 departments
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Select Day:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {weeklyTrend.map((item, idx) => (
                  <button
                    key={item.day}
                    onClick={() => setActiveChartDay(idx)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeChartDay === idx
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SVG Interactive Trend & Bar Chart */}
          <div className="h-56 relative flex flex-col justify-end">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-slate-400">
              <div className="border-b border-slate-100 pb-1">100%</div>
              <div className="border-b border-slate-100 pb-1">75%</div>
              <div className="border-b border-slate-100 pb-1">50%</div>
              <div className="border-b border-slate-100 pb-1">25%</div>
              <div className="border-b border-slate-200 pb-1">0%</div>
            </div>

            {/* Bars container */}
            <div className="relative z-10 grid grid-cols-5 gap-4 h-44 items-end px-6">
              {weeklyTrend.map((item, idx) => {
                const isSelected = activeChartDay === idx;
                const barHeight = `${item.rate}%`;
                return (
                  <div
                    key={item.day}
                    onClick={() => setActiveChartDay(idx)}
                    className="flex flex-col items-center cursor-pointer group h-full justify-end"
                  >
                    {/* Hover detail tooltip */}
                    {isSelected && (
                      <div className="mb-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] rounded shadow-md whitespace-nowrap tabular-nums">
                        {item.present}/{item.total} staff ({item.rate}%)
                      </div>
                    )}

                    {/* Bar */}
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md overflow-hidden flex items-end h-full">
                      <div
                        style={{ height: barHeight }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          isSelected
                            ? 'bg-blue-600'
                            : 'bg-slate-300 group-hover:bg-slate-400'
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-center">
                      <span className={`block text-xs font-medium ${isSelected ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                        {item.day}
                      </span>
                      <span className="block text-[10px] text-slate-400 tabular-nums">
                        {item.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick summary below chart */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400 font-medium">Avg Participation</p>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">92.6%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Peak Day</p>
              <p className="text-lg font-bold text-emerald-600 tabular-nums mt-0.5">Wednesday (100%)</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">On-Time Arrival</p>
              <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">88.4%</p>
            </div>
          </div>
        </div>

        {/* Department Attendance Today (1 Column) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Department Check-In</h3>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Today
              </span>
            </div>

            <div className="space-y-4">
              {departmentStats.map((item) => (
                <div key={item.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.department}</span>
                    <span className="text-slate-500 tabular-nums">
                      <strong className="text-slate-900 font-semibold">{item.present}</strong> / {item.total} ({item.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.rate >= 90
                          ? 'bg-emerald-500'
                          : item.rate >= 75
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentPage('directory')}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              View Department Staff Directory
            </button>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Activity & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities (1.5 / 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Activities</h3>
            <span className="text-xs text-slate-500">Live system updates</span>
          </div>

          <div className="divide-y divide-slate-100">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="py-3 flex items-start gap-3.5 first:pt-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {act.type === 'leave_applied' && <CalendarDays className="w-4 h-4 text-indigo-600" />}
                  {act.type === 'leave_approved' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {act.type === 'leave_rejected' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  {act.type === 'check_in' && <Clock className="w-4 h-4 text-blue-600" />}
                  {act.type === 'employee_added' && <Users className="w-4 h-4 text-sky-600" />}
                  {act.type === 'announcement' && <Megaphone className="w-4 h-4 text-amber-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900">{act.title}</p>
                    <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Announcements (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Announcements</h3>
              </div>
              <button
                onClick={() => setCurrentPage('announcements')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentPage('announcements')}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium text-blue-600">{item.category}</span>
                    <span className="tabular-nums">{item.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {currentUser?.role === 'admin' && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (onOpenNewAnnouncement) onOpenNewAnnouncement();
                  else setCurrentPage('announcements');
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Publish Announcement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
