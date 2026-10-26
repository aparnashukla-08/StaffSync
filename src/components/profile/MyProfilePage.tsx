import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Edit2,
  Save,
  X,
  Clock,
  CalendarDays,
  Shield,
  Heart
} from 'lucide-react';

export const MyProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, attendance, leaveRequests, showToast, refreshData } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    bio: currentUser?.bio || '',
    emergencyName: currentUser?.emergencyContact?.name || '',
    emergencyRelationship: currentUser?.emergencyContact?.relationship || '',
    emergencyPhone: currentUser?.emergencyContact?.phone || ''
  });

  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'leaves'>('info');

  if (!currentUser) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-2xs">
        <UserCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Active Profile Session</h3>
        <p className="text-xs text-slate-500 mt-1">Please sign in or select a demo role.</p>
      </div>
    );
  }

  // Filter attendance and leaves for current user
  const myAttendance = attendance.filter((a) => a.employeeId === currentUser.employeeId);
  const myLeaves = leaveRequests.filter((l) => l.employeeId === currentUser.employeeId);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.updateProfile({
        name: profileForm.name.trim() || currentUser.name,
        phone: profileForm.phone.trim() || currentUser.phone,
        address: profileForm.address.trim() || currentUser.address,
        bio: profileForm.bio.trim() || currentUser.bio,
        emergencyContact: {
          name: profileForm.emergencyName.trim() || currentUser.emergencyContact.name,
          relationship: profileForm.emergencyRelationship.trim() || currentUser.emergencyContact.relationship,
          phone: profileForm.emergencyPhone.trim() || currentUser.emergencyContact.phone
        }
      });

      if (res.user) {
        setCurrentUser(res.user);
      }
      setIsEditing(false);
      showToast(res.message || 'Your profile information was updated successfully!', 'success');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 flex items-end justify-between pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-300">
            StaffSync Identity · {currentUser.employeeId}
          </span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-xl object-cover ring-4 ring-white shadow-md bg-white shrink-0"
              />
              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">{currentUser.designation}</p>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser.department} Department</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mt-2">
            {currentUser.bio}
          </p>

          {/* Navigation sub-tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pt-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Personal & Work Details
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              My Attendance ({myAttendance.length})
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === 'leaves'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              My Leave Requests ({myLeaves.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Work Information Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Organizational Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Employee ID</span>
                <p className="font-semibold text-slate-800 font-mono mt-0.5">{currentUser.employeeId}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Department</span>
                <p className="font-semibold text-slate-800 mt-0.5">{currentUser.department}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Designation</span>
                <p className="font-semibold text-slate-800 mt-0.5">{currentUser.designation}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Date of Joining</span>
                <p className="font-semibold text-slate-800 tabular-nums mt-0.5">{currentUser.joinedDate}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Access Permission Role</span>
                <p className="font-semibold text-slate-800 uppercase mt-0.5">{currentUser.role}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Employment Type</span>
                <p className="font-semibold text-slate-800 mt-0.5">Full-Time (Salaried)</p>
              </div>
            </div>
          </div>

          {/* Contact Details & Emergency */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">Contact & Emergency Dossier</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Corporate Email</span>
                <p className="font-semibold text-slate-800 mt-0.5">{currentUser.email}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Primary Contact Phone</span>
                <p className="font-semibold text-slate-800 font-mono mt-0.5">{currentUser.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Home / Resident Address</span>
                <p className="font-medium text-slate-700 mt-0.5">{currentUser.address}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Primary Emergency Contact
                </span>
                <p className="text-slate-900 font-semibold text-xs">
                  {currentUser.emergencyContact.name} ({currentUser.emergencyContact.relationship})
                </p>
                <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                  {currentUser.emergencyContact.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Personal Punch Log History</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No attendance records for your profile yet.
                  </td>
                </tr>
              ) : (
                myAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono tabular-nums">{rec.date}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{rec.checkIn || '--'}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{rec.checkOut || '--'}</td>
                    <td className="py-3 px-4 font-semibold">{rec.workHours > 0 ? `${rec.workHours} hrs` : '--'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[11px] rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{rec.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leaves' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Personal Leave Submissions</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reviewer Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    You have not submitted any leave requests.
                  </td>
                </tr>
              ) : (
                myLeaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{lv.leaveType}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      {lv.startDate} → {lv.endDate}
                    </td>
                    <td className="py-3 px-4 font-bold">{lv.days}d</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{lv.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[11px] rounded font-semibold ${
                          lv.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : lv.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{lv.reviewNote || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Update Profile Information</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Name</label>
                  <input
                    type="text"
                    value={profileForm.emergencyName}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={profileForm.emergencyPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
