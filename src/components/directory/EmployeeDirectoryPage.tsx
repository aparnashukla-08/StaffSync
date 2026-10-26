import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { EmployeeDetailModal } from '../employees/EmployeeDetailModal';
import {
  Contact,
  Search,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Building,
  User,
  Filter
} from 'lucide-react';

export const EmployeeDirectoryPage: React.FC = () => {
  const { employees } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const departments = ['All', 'Engineering', 'Product', 'Human Resources', 'Marketing', 'Sales', 'Finance'];

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDept && matchesSearch;
    });
  }, [employees, selectedDept, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">StaffSync Employee Directory</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect with team members across engineering, product, people operations, and executive leadership
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, role, email, or skill tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-1">
          Showing <strong className="text-slate-800 tabular-nums">{filteredEmployees.length}</strong> colleagues
        </div>
      </div>

      {/* Directory Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 shadow-2xs">
          <Contact className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-slate-600 text-sm">No team members match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting your department or query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Profile Strip */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">{emp.designation}</p>
                      <span className="text-[11px] text-blue-600 font-medium">{emp.department}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider shrink-0 ${
                      emp.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : emp.status === 'On Leave'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Info List */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <a
                    href={`mailto:${emp.email}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </a>

                  <a
                    href={`tel:${emp.phone}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors truncate"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{emp.phone}</span>
                  </a>

                  <div className="flex items-center gap-2 text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.workLocation}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {emp.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                  {emp.skills.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                      +{emp.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">{emp.employeeId}</span>
                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>View Dossier</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dossier Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
};
