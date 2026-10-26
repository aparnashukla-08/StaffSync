import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { ManualAttendanceModal } from './ManualAttendanceModal';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  UserCheck,
  Download,
  Search,
  Timer
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const {
    attendance,
    addManualAttendance,
    currentUser,
    todayAttendance,
    userCheckIn,
    userCheckOut,
    showToast
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Live timer for check-in
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const departments = ['All', 'Engineering', 'Product', 'Human Resources', 'Marketing', 'Sales', 'Finance'];
  const statuses = ['All', 'Present', 'Late', 'Half Day', 'Absent'];

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return attendance.filter((rec) => {
      const matchesDate = !selectedDate || rec.date === selectedDate;
      const matchesDept = selectedDept === 'All' || rec.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || rec.status === selectedStatus;
      const matchesSearch =
        rec.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDate && matchesDept && matchesStatus && matchesSearch;
    });
  }, [attendance, selectedDate, selectedDept, selectedStatus, searchQuery]);

  // Statistics for selected date
  const dateRecords = attendance.filter((a) => !selectedDate || a.date === selectedDate);
  const presentCount = dateRecords.filter(
    (a) => a.status === 'Present' || a.status === 'Late' || a.status === 'Half Day'
  ).length;
  const onTimeCount = dateRecords.filter((a) => a.status === 'Present').length;
  const lateCount = dateRecords.filter((a) => a.status === 'Late').length;
  const avgHours =
    dateRecords.length > 0
      ? (dateRecords.reduce((acc, r) => acc + r.workHours, 0) / (presentCount || 1)).toFixed(1)
      : '0.0';

  const onTimePercentage = presentCount > 0 ? Math.round((onTimeCount / presentCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-time Check-In Desk */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Live digital clock */}
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Timer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                StaffSync Time Engine
              </p>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <p className="text-xs text-slate-500">
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Current User punch status */}
          <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Your Daily Punch Status
            </span>
            {todayAttendance?.checkIn ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                  </span>
                  <span className="text-xs text-slate-700 font-mono tabular-nums font-semibold">
                    {todayAttendance.checkIn}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {todayAttendance.checkOut ? (
                    <>Checked out at <span className="font-mono font-medium">{todayAttendance.checkOut}</span></>
                  ) : (
                    <>Shift active · Estimated: <span className="font-mono font-semibold text-slate-800">7h 30m</span></>
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Not Checked In Yet
                </span>
                <p className="text-xs text-slate-500">Mark your arrival for today&rsquo;s shift.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-start md:justify-end gap-3">
            {todayAttendance?.checkIn ? (
              !todayAttendance.checkOut ? (
                <button
                  onClick={userCheckOut}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Clock Out For The Day
                </button>
              ) : (
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-lg">
                  Day Completed
                </div>
              )
            ) : (
              <button
                onClick={() => userCheckIn()}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Punch In Now
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Manual Entry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Count</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{presentCount}</span>
            <span className="text-xs text-slate-500">records</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Punctuality Rate</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">{onTimePercentage}%</span>
            <span className="text-xs text-slate-500">on time</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums">{lateCount}</span>
            <span className="text-xs text-slate-500">flagged</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Shift</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{avgHours}h</span>
            <span className="text-xs text-slate-500">per present staff</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search by employee */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search staff name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Department Select */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  Dept: {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800 tabular-nums">{filteredRecords.length}</strong> timesheet records
          </span>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Show All History
            </button>
          )}
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check In</th>
                <th className="py-3.5 px-4">Check Out</th>
                <th className="py-3.5 px-4">Work Hours</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600 text-sm">No attendance records found for this criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust your filters or date selection.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{rec.employeeName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{rec.employeeId}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">{rec.department}</td>

                    <td className="py-3 px-4 text-slate-500 tabular-nums">{rec.date}</td>

                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {rec.checkIn || <span className="text-slate-400 font-sans italic">--</span>}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {rec.checkOut || <span className="text-slate-400 font-sans italic">--</span>}
                    </td>

                    <td className="py-3 px-4 tabular-nums font-semibold text-slate-800">
                      {rec.workHours > 0 ? `${rec.workHours} hrs` : '--'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : rec.status === 'Half Day'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {rec.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={addManualAttendance}
      />
    </div>
  );
};
