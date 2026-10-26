import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../types';
import { ApplyLeaveModal } from './ApplyLeaveModal';
import { MOCK_LEAVE_BALANCES } from '../../data/mockData';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const LeaveManagementPage: React.FC = () => {
  const { leaveRequests, applyLeave, reviewLeave, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Review modal state
  const [reviewModalData, setReviewModalData] = useState<{
    id: string;
    applicant: string;
    action: 'Approved' | 'Rejected';
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const departments = ['All', 'Engineering', 'Product', 'Human Resources', 'Marketing', 'Sales', 'Finance'];

  // Current user's leave balance
  const userBalance =
    (currentUser && MOCK_LEAVE_BALANCES[currentUser.employeeId]) || {
      annual: { used: 4, total: 20 },
      sick: { used: 2, total: 12 },
      casual: { used: 1, total: 6 },
      unpaid: { used: 0, total: 10 }
    };

  // Filter requests
  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter((req) => {
      const matchesTab = activeTab === 'All' || req.status === activeTab;
      const matchesDept = selectedDept === 'All' || req.department === selectedDept;
      const matchesSearch =
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesDept && matchesSearch;
    });
  }, [leaveRequests, activeTab, selectedDept, searchQuery]);

  const pendingCount = leaveRequests.filter((l) => l.status === 'Pending').length;

  const handleOpenReview = (id: string, applicant: string, action: 'Approved' | 'Rejected') => {
    setReviewModalData({ id, applicant, action });
    setReviewNote(action === 'Approved' ? 'Approved by leadership. Enjoy your time off!' : 'Unable to approve due to team staffing constraints.');
  };

  const handleConfirmReview = () => {
    if (reviewModalData) {
      reviewLeave(reviewModalData.id, reviewModalData.action, reviewNote);
      setReviewModalData(null);
      setReviewNote('');
    }
  };

  const canReview = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Top Banner: Leave Balance Cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave Management & Time Off</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review company vacation quotas, apply for personal leaves, and manage team requests
            </p>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Apply For Leave
          </button>
        </div>

        {/* 4 Balance cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Annual / Vacation
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {userBalance.annual.total - userBalance.annual.used}
              </span>
              <span className="text-xs text-slate-500">
                / {userBalance.annual.total} days left
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{
                  width: `${((userBalance.annual.total - userBalance.annual.used) / userBalance.annual.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sick & Medical
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {userBalance.sick.total - userBalance.sick.used}
              </span>
              <span className="text-xs text-slate-500">
                / {userBalance.sick.total} days left
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{
                  width: `${((userBalance.sick.total - userBalance.sick.used) / userBalance.sick.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Casual / Personal
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {userBalance.casual.total - userBalance.casual.used}
              </span>
              <span className="text-xs text-slate-500">
                / {userBalance.casual.total} days left
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{
                  width: `${((userBalance.casual.total - userBalance.casual.used) / userBalance.casual.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600 tabular-nums">
                {pendingCount}
              </span>
              <span className="text-xs text-slate-500">
                awaiting review
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 truncate">
              {canReview ? 'You have permissions to approve' : 'Manager review pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Department Select */}
          <div className="w-full sm:w-48">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  Dept: {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search applicant name, employee ID, or leave reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Reason & Notes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600 text-sm">No leave requests found</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching tabs or adjusting search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{req.employeeName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {req.employeeId} · {req.department}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">{req.leaveType}</td>

                    <td className="py-3 px-4 text-slate-600 tabular-nums">
                      <span>{req.startDate}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span>{req.endDate}</span>
                    </td>

                    <td className="py-3 px-4 tabular-nums font-semibold text-slate-800">
                      {req.days} d
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-slate-700 leading-snug line-clamp-2">{req.reason}</p>
                      {req.reviewNote && (
                        <p className="text-[11px] text-slate-500 mt-1 italic flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{req.reviewNote}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {req.status === 'Pending' ? (
                        canReview ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenReview(req.id, req.employeeName, 'Approved')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1"
                              title="Approve leave"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenReview(req.id, req.employeeName, 'Rejected')}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors flex items-center gap-1"
                              title="Reject leave"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Awaiting Lead</span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {req.reviewDate || 'Decided'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onApply={applyLeave}
      />

      {/* Review Dialog Modal */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">
              {reviewModalData.action === 'Approved' ? 'Approve Leave Request' : 'Decline Leave Request'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Applicant: <strong className="text-slate-800">{reviewModalData.applicant}</strong>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Decision Note / Message to Staff
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setReviewModalData(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReview}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors ${
                  reviewModalData.action === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {reviewModalData.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
