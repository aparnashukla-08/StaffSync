import React, { useState, useEffect } from 'react';
import { Employee, EmployeeStatus } from '../../types';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id'>) => void;
  employeeToEdit?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit
}) => {
  const isEditing = !!employeeToEdit;

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    designation: '',
    department: 'Engineering',
    status: 'Active' as EmployeeStatus,
    phone: '',
    joinedDate: new Date().toISOString().split('T')[0],
    salary: 120000,
    manager: 'Sarah Jenkins',
    workLocation: 'San Francisco HQ',
    address: '',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    skillsString: 'React, TypeScript, Collaboration',
    avatar: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        employeeId: employeeToEdit.employeeId,
        name: employeeToEdit.name,
        email: employeeToEdit.email,
        designation: employeeToEdit.designation,
        department: employeeToEdit.department,
        status: employeeToEdit.status,
        phone: employeeToEdit.phone,
        joinedDate: employeeToEdit.joinedDate,
        salary: employeeToEdit.salary,
        manager: employeeToEdit.manager,
        workLocation: employeeToEdit.workLocation,
        address: employeeToEdit.address,
        emergencyName: employeeToEdit.emergencyContact?.name || '',
        emergencyRelationship: employeeToEdit.emergencyContact?.relationship || 'Spouse',
        emergencyPhone: employeeToEdit.emergencyContact?.phone || '',
        skillsString: employeeToEdit.skills?.join(', ') || '',
        avatar: employeeToEdit.avatar
      });
      setErrors({});
    } else {
      // Auto-generate employee ID
      const randomNum = Math.floor(1015 + Math.random() * 800);
      setFormData({
        employeeId: `EMP-${randomNum}`,
        name: '',
        email: '',
        designation: '',
        department: 'Engineering',
        status: 'Active',
        phone: '+1 (555) 000-0000',
        joinedDate: new Date().toISOString().split('T')[0],
        salary: 110000,
        manager: 'David Miller',
        workLocation: 'San Francisco HQ',
        address: '100 Market St, San Francisco, CA',
        emergencyName: '',
        emergencyRelationship: 'Spouse',
        emergencyPhone: '+1 (555) 000-0001',
        skillsString: 'React, Node.js, Agile',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
      });
      setErrors({});
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.designation.trim()) errs.designation = 'Job designation is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.salary || Number(formData.salary) <= 0) errs.salary = 'Enter a valid base salary';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const skills = formData.skillsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      employeeId: formData.employeeId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      designation: formData.designation.trim(),
      department: formData.department,
      status: formData.status,
      phone: formData.phone.trim(),
      joinedDate: formData.joinedDate,
      salary: Number(formData.salary),
      manager: formData.manager,
      workLocation: formData.workLocation,
      address: formData.address.trim(),
      emergencyContact: {
        name: formData.emergencyName || 'Primary Contact',
        relationship: formData.emergencyRelationship || 'Family',
        phone: formData.emergencyPhone || formData.phone
      },
      skills: skills.length > 0 ? skills : ['General'],
      avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? 'Edit Employee Details' : 'Add New Employee'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? `Updating record for ${employeeToEdit?.employeeId}`
                  : 'Enroll a new staff member into StaffSync database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section: Basic Information */}
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            General Identification
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isEditing}
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rachel Adams"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-rose-400 ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-500/20'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="rachel.adams@staffsync.internal"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-400 ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-500/20'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="+1 (555) 012-3456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Section: Job Placement */}
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 pt-2">
            Job & Department Placement
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lead QA Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.designation
                    ? 'border-rose-400 ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-500/20'
                }`}
              />
              {errors.designation && <p className="text-[11px] text-rose-500 mt-1">{errors.designation}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Salary ($ USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="115000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Joining
              </label>
              <input
                type="date"
                value={formData.joinedDate}
                onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Location
              </label>
              <select
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="San Francisco HQ">San Francisco HQ</option>
                <option value="New York Hub">New York Hub</option>
                <option value="Chicago Hub">Chicago Hub</option>
                <option value="Remote (US East)">Remote (US East)</option>
                <option value="Remote (US West)">Remote (US West)</option>
              </select>
            </div>
          </div>

          {/* Section: Additional & Skills */}
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 pt-2">
            Skills & Skills Tags (comma separated)
          </div>

          <div>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, Figma, System Design"
              value={formData.skillsString}
              onChange={(e) => setFormData({ ...formData, skillsString: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {isEditing ? 'Save Changes' : 'Create Employee Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
