import React from 'react';
import { Employee } from '../../types';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Shield,
  Clock,
  Heart
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit?: (emp: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  onClose,
  onEdit
}) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="relative bg-slate-900 px-6 pt-6 pb-12 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold tracking-wide uppercase">
            <span>StaffSync Employee Dossier</span>
            <span>·</span>
            <span className="font-mono">{employee.employeeId}</span>
          </div>
        </div>

        {/* Profile Card Overlay */}
        <div className="px-6 pb-6 -mt-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-20 h-20 rounded-xl object-cover ring-4 ring-white shadow-md bg-white shrink-0"
            />
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded font-semibold ${
                  employee.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : employee.status === 'On Leave'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {employee.status}
              </span>
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(employee);
                  }}
                  className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">{employee.name}</h3>
            <p className="text-sm font-medium text-slate-600">{employee.designation}</p>
            <p className="text-xs text-slate-500 mt-0.5">{employee.department} Department</p>
          </div>

          {/* Quick contact pills */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a
              href={`mailto:${employee.email}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </a>
            <a
              href={`tel:${employee.phone}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{employee.phone}</span>
            </a>
          </div>

          {/* Detailed Specifications */}
          <div className="mt-5 space-y-4 border-t border-slate-100 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-medium">Reporting Lead</span>
                <p className="font-semibold text-slate-800 mt-0.5">{employee.manager}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Work Location</span>
                <p className="font-semibold text-slate-800 mt-0.5">{employee.workLocation}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date of Joining</span>
                <p className="font-semibold text-slate-800 tabular-nums mt-0.5">{employee.joinedDate}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Annual Base Salary</span>
                <p className="font-semibold text-slate-800 tabular-nums mt-0.5">
                  ${employee.salary.toLocaleString()} USD
                </p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Office & Residential Address</span>
              <p className="font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {employee.address}
              </p>
            </div>

            {/* Emergency Contact */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-semibold flex items-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Emergency Contact
              </span>
              <p className="text-slate-800 font-medium">
                {employee.emergencyContact.name} ({employee.emergencyContact.relationship}) ·{' '}
                <span className="tabular-nums font-mono">{employee.emergencyContact.phone}</span>
              </p>
            </div>

            {/* Skills */}
            <div>
              <span className="text-slate-400 font-medium block mb-1.5">Core Competencies</span>
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
