import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, EmployeeStatus } from '../../types';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import {
  Users,
  Search,
  Plus,
  Download,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  CheckCircle2,
  Building,
  Mail,
  Phone
} from 'lucide-react';

export const EmployeeManagementPage: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, currentUser, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'department' | 'salary'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const departments = ['All', 'Engineering', 'Product', 'Human Resources', 'Marketing', 'Sales', 'Finance'];
  const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

  // Filter & sort logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        const matchesSearch =
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
        const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;

        return matchesSearch && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        let valA: string | number = a.name;
        let valB: string | number = b.name;

        if (sortBy === 'id') {
          valA = a.employeeId;
          valB = b.employeeId;
        } else if (sortBy === 'department') {
          valA = a.department;
          valB = b.department;
        } else if (sortBy === 'salary') {
          valA = a.salary;
          valB = b.salary;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [employees, searchQuery, selectedDepartment, selectedStatus, sortBy, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) {
      showToast('No employee records to export', 'error');
      return;
    }

    const headers = ['Employee ID', 'Full Name', 'Designation', 'Department', 'Email', 'Phone', 'Status', 'Joining Date', 'Salary (USD)', 'Work Location'];
    const rows = filteredEmployees.map((e) => [
      `"${e.employeeId}"`,
      `"${e.name}"`,
      `"${e.designation}"`,
      `"${e.department}"`,
      `"${e.email}"`,
      `"${e.phone}"`,
      `"${e.status}"`,
      `"${e.joinedDate}"`,
      `"${e.salary}"`,
      `"${e.workLocation}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StaffSync_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredEmployees.length} employee records to CSV`, 'success');
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory & Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, search, onboard, and maintain personnel records across the organization
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => {
                setEmployeeToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Employee
            </button>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Admin privileges required to add staff
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, ID, role, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Select */}
          <div className="w-full md:w-48">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
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
          <div className="w-full md:w-40">
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

        {/* Quick filter summary chips */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800 tabular-nums">{filteredEmployees.length}</strong> of{' '}
            <strong className="text-slate-800 tabular-nums">{employees.length}</strong> employees
          </span>
          {(searchQuery || selectedDepartment !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('All');
                setSelectedStatus('All');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600 text-sm">No employees match your search criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try modifying or clearing your filters above.</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Employee Profile Cell */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => setEmployeeToView(emp)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left truncate block text-xs"
                          >
                            {emp.name}
                          </button>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {emp.employeeId}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-700 font-medium">{emp.department}</td>

                    {/* Designation */}
                    <td className="py-3 px-4 text-slate-600">{emp.designation}</td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{emp.joinedDate}</td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEmployeeToView(emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                          <button
                            onClick={() => {
                              setEmployeeToEdit(emp);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => setEmployeeToDelete(emp)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={(data) => {
          if (employeeToEdit) {
            updateEmployee(employeeToEdit.id, data);
          } else {
            addEmployee(data);
          }
        }}
        employeeToEdit={employeeToEdit}
      />

      {/* View Dossier Modal */}
      <EmployeeDetailModal
        employee={employeeToView}
        onClose={() => setEmployeeToView(null)}
        onEdit={(emp) => {
          setEmployeeToEdit(emp);
          setIsAddModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Delete Employee Record?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{employeeToDelete.name}</strong> (
              <span className="font-mono">{employeeToDelete.employeeId}</span>) from the organization?
              This will remove all associated profile data.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
