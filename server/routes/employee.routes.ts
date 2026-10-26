import { Router, Response } from 'express';
import { EmployeeModel } from '../models/Employee';
import { UserModel } from '../models/User';
import { ActivityModel } from '../models/Activity';
import { verifyToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';
import { isDbConnected, memoryStore } from '../db';
import bcrypt from 'bcryptjs';

const router = Router();

// GET /api/employees - List and filter employees
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, department, status } = req.query;

    if (isDbConnected()) {
      const query: any = {};

      if (department && department !== 'All') {
        query.department = department;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim();
        query.$or = [
          { name: { $regex: s, $options: 'i' } },
          { employeeId: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
          { designation: { $regex: s, $options: 'i' } }
        ];
      }

      const employees = await EmployeeModel.find(query).sort({ createdAt: -1 });
      res.json({ success: true, count: employees.length, employees });
    } else {
      let filtered = [...memoryStore.employees];

      if (department && department !== 'All') {
        filtered = filtered.filter((e) => e.department === department);
      }

      if (status && status !== 'All') {
        filtered = filtered.filter((e) => e.status === status);
      }

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(s) ||
            e.employeeId.toLowerCase().includes(s) ||
            e.email.toLowerCase().includes(s) ||
            e.designation.toLowerCase().includes(s)
        );
      }

      res.json({ success: true, count: filtered.length, employees: filtered });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const employee = await EmployeeModel.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { employeeId: id }]
      });

      if (!employee) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }

      res.json({ success: true, employee });
    } else {
      const employee = memoryStore.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
      if (!employee) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }
      res.json({ success: true, employee });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/employees - Admin only: Add new employee
router.post('/', verifyToken, requireRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      employeeId,
      name,
      email,
      designation,
      department,
      status = 'Active',
      phone,
      joinedDate = new Date().toISOString().split('T')[0],
      salary,
      manager = 'Executive Board',
      workLocation = 'San Francisco HQ',
      address = '',
      emergencyContact,
      skills = [],
      avatar
    } = req.body;

    if (!employeeId || !name || !email || !designation || !department || !phone || salary === undefined) {
      res.status(400).json({
        success: false,
        message: 'Missing required employee fields: employeeId, name, email, designation, department, phone, and salary.'
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanId = employeeId.trim();

    if (isDbConnected()) {
      // Check for duplicate employeeId or email
      const existing = await EmployeeModel.findOne({
        $or: [{ employeeId: cleanId }, { email: cleanEmail }]
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: existing.employeeId === cleanId
            ? `Employee ID "${cleanId}" is already assigned to another employee.`
            : `Email address "${cleanEmail}" is already registered.`
        });
        return;
      }

      const defaultAvatar =
        avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80`;

      const newEmployee = await EmployeeModel.create({
        employeeId: cleanId,
        name: name.trim(),
        email: cleanEmail,
        designation: designation.trim(),
        department,
        status,
        phone: phone.trim(),
        joinedDate,
        salary: Number(salary),
        manager,
        workLocation,
        address: address.trim(),
        emergencyContact: emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone },
        skills: Array.isArray(skills) ? skills : [skills],
        avatar: defaultAvatar
      });

      // Also create login account if missing
      const userExists = await UserModel.findOne({ email: cleanEmail });
      if (!userExists) {
        const hashedPassword = await bcrypt.hash('StaffSync2026!', 10);
        await UserModel.create({
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: department === 'Human Resources' ? 'admin' : 'employee',
          employeeId: cleanId,
          designation: designation.trim(),
          department,
          avatar: defaultAvatar,
          phone: phone.trim(),
          address: address.trim(),
          joinedDate
        });
      }

      // Log activity
      await ActivityModel.create({
        type: 'employee_added',
        title: 'New Employee Onboarded',
        description: `${name} joined as ${designation} (${department})`,
        actor: req.user?.name || 'HR Admin'
      });

      res.status(201).json({
        success: true,
        message: `Employee ${name} successfully onboarded`,
        employee: newEmployee
      });
    } else {
      // In-memory fallback
      const existing = memoryStore.employees.find(
        (e) => e.employeeId === cleanId || e.email.toLowerCase() === cleanEmail
      );

      if (existing) {
        res.status(409).json({
          success: false,
          message: existing.employeeId === cleanId
            ? `Employee ID "${cleanId}" already exists.`
            : `Email "${cleanEmail}" already exists.`
        });
        return;
      }

      const newId = `emp_${Date.now()}`;
      const defaultAvatar =
        avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80`;

      const newEmployee = {
        id: newId,
        _id: newId,
        employeeId: cleanId,
        name: name.trim(),
        email: cleanEmail,
        designation: designation.trim(),
        department,
        status,
        phone: phone.trim(),
        joinedDate,
        salary: Number(salary),
        manager,
        workLocation,
        address: address.trim(),
        emergencyContact: emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone },
        skills: Array.isArray(skills) ? skills : [skills],
        avatar: defaultAvatar
      };

      memoryStore.employees.unshift(newEmployee);

      // Create matching user in memory if absent
      const userExists = memoryStore.users.find((u) => u.email === cleanEmail);
      if (!userExists) {
        const hashedPassword = await bcrypt.hash('StaffSync2026!', 10);
        memoryStore.users.push({
          id: `usr_${Date.now()}`,
          _id: `usr_${Date.now()}`,
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: department === 'Human Resources' ? 'admin' : 'employee',
          employeeId: cleanId,
          designation: designation.trim(),
          department,
          avatar: defaultAvatar,
          phone: phone.trim(),
          address: address.trim(),
          joinedDate
        });
      }

      memoryStore.activities.unshift({
        id: `act_${Date.now()}`,
        _id: `act_${Date.now()}`,
        type: 'employee_added',
        title: 'New Employee Onboarded',
        description: `${name} joined as ${designation} (${department})`,
        timestamp: 'Just now',
        actor: req.user?.name || 'HR Admin'
      });

      res.status(201).json({
        success: true,
        message: `Employee ${name} successfully onboarded`,
        employee: newEmployee
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/employees/:id - Admin or Manager: Update employee
router.put('/:id', verifyToken, requireRoles('admin', 'manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Disallow employeeId modifications to prevent integrity issues
    delete updates.employeeId;

    if (isDbConnected()) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { $or: [{ id }, { employeeId: id }] };

      const updated = await EmployeeModel.findOneAndUpdate(query, { $set: updates }, { new: true });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }

      // Sync name / department / designation to user login account
      await UserModel.findOneAndUpdate(
        { employeeId: updated.employeeId },
        {
          $set: {
            name: updated.name,
            designation: updated.designation,
            department: updated.department,
            phone: updated.phone,
            address: updated.address
          }
        }
      );

      res.json({ success: true, message: 'Employee record updated', employee: updated });
    } else {
      const idx = memoryStore.employees.findIndex((e) => e.id === id || e._id === id || e.employeeId === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }

      memoryStore.employees[idx] = { ...memoryStore.employees[idx], ...updates };
      const updated = memoryStore.employees[idx];

      res.json({ success: true, message: 'Employee record updated', employee: updated });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/employees/:id - Admin only: Delete employee
router.delete('/:id', verifyToken, requireRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { $or: [{ id }, { employeeId: id }] };

      const emp = await EmployeeModel.findOne(query);
      if (!emp) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }

      await EmployeeModel.deleteOne(query);
      await UserModel.deleteOne({ employeeId: emp.employeeId });

      await ActivityModel.create({
        type: 'employee_updated',
        title: 'Employee Removed',
        description: `${emp.name} (${emp.employeeId}) was removed from active staff`,
        actor: req.user?.name || 'HR Admin'
      });

      res.json({ success: true, message: `Employee ${emp.name} was removed successfully.` });
    } else {
      const idx = memoryStore.employees.findIndex((e) => e.id === id || e._id === id || e.employeeId === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Employee not found' });
        return;
      }

      const [removed] = memoryStore.employees.splice(idx, 1);
      memoryStore.users = memoryStore.users.filter((u) => u.employeeId !== removed.employeeId);

      res.json({ success: true, message: `Employee ${removed.name} was removed successfully.` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
