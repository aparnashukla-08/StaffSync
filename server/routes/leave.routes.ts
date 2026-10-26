import { Router, Response } from 'express';
import { LeaveRequestModel } from '../models/LeaveRequest';
import { ActivityModel } from '../models/Activity';
import { verifyToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';
import { isDbConnected, memoryStore } from '../db';

const router = Router();

// GET /api/leaves - List leave requests with RBAC and filtering
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, department, search } = req.query;
    const user = req.user!;

    if (isDbConnected()) {
      const query: any = {};

      // If regular employee, only show their own leaves
      if (user.role === 'employee') {
        query.employeeId = user.employeeId;
      } else if (department && department !== 'All') {
        query.department = department;
      }

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim();
        query.$or = [
          { employeeName: { $regex: s, $options: 'i' } },
          { employeeId: { $regex: s, $options: 'i' } },
          { reason: { $regex: s, $options: 'i' } }
        ];
      }

      const leaves = await LeaveRequestModel.find(query).sort({ createdAt: -1 });
      res.json({ success: true, count: leaves.length, leaves });
    } else {
      let filtered = [...memoryStore.leaves];

      if (user.role === 'employee') {
        filtered = filtered.filter((l) => l.employeeId === user.employeeId);
      } else if (department && department !== 'All') {
        filtered = filtered.filter((l) => l.department === department);
      }

      if (status && status !== 'All') {
        filtered = filtered.filter((l) => l.status === status);
      }

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.employeeName.toLowerCase().includes(s) ||
            l.employeeId.toLowerCase().includes(s) ||
            l.reason.toLowerCase().includes(s)
        );
      }

      res.json({ success: true, count: filtered.length, leaves: filtered });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leaves/balance/:employeeId - Get quota usage
router.get('/balance/:employeeId', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId } = req.params;

    const baseQuotas = {
      annual: { total: 20, used: 0 },
      sick: { total: 12, used: 0 },
      casual: { total: 6, used: 0 },
      unpaid: { total: 10, used: 0 }
    };

    let approvedLeaves: any[] = [];

    if (isDbConnected()) {
      approvedLeaves = await LeaveRequestModel.find({ employeeId, status: 'Approved' });
    } else {
      approvedLeaves = memoryStore.leaves.filter(
        (l) => l.employeeId === employeeId && l.status === 'Approved'
      );
    }

    approvedLeaves.forEach((l) => {
      const typeKey = l.leaveType.toLowerCase() as keyof typeof baseQuotas;
      if (baseQuotas[typeKey]) {
        baseQuotas[typeKey].used += Number(l.days) || 0;
      }
    });

    res.json({ success: true, balance: baseQuotas });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/leaves - Apply for leave
router.post('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { leaveType, startDate, endDate, days, reason, emergencyPhone } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required.'
      });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
      return;
    }

    if (end < start) {
      res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
      return;
    }

    const calculatedDays =
      Number(days) > 0 ? Number(days) : Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    if (isDbConnected()) {
      const newLeave = await LeaveRequestModel.create({
        employeeId: user.employeeId,
        employeeName: user.name,
        department: user.department,
        leaveType,
        startDate,
        endDate,
        days: calculatedDays,
        reason: reason.trim(),
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
        emergencyPhone: emergencyPhone || ''
      });

      await ActivityModel.create({
        type: 'leave_applied',
        title: 'New Leave Request',
        description: `${user.name} applied for ${calculatedDays} day(s) of ${leaveType} leave`,
        actor: user.name
      });

      res.status(201).json({
        success: true,
        message: 'Leave application submitted for approval',
        leave: newLeave
      });
    } else {
      const newId = `lv_${Date.now()}`;
      const newLeave = {
        id: newId,
        _id: newId,
        employeeId: user.employeeId,
        employeeName: user.name,
        department: user.department,
        leaveType,
        startDate,
        endDate,
        days: calculatedDays,
        reason: reason.trim(),
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
        emergencyPhone: emergencyPhone || ''
      };

      memoryStore.leaves.unshift(newLeave);

      memoryStore.activities.unshift({
        id: `act_${Date.now()}`,
        _id: `act_${Date.now()}`,
        type: 'leave_applied',
        title: 'New Leave Request',
        description: `${user.name} applied for ${calculatedDays} day(s) of ${leaveType} leave`,
        timestamp: 'Just now',
        actor: user.name
      });

      res.status(201).json({
        success: true,
        message: 'Leave application submitted for approval',
        leave: newLeave
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/leaves/:id/review - Admin or Manager: Approve or reject leave
router.patch('/:id/review', verifyToken, requireRoles('admin', 'manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;
    const reviewer = req.user!;

    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
      return;
    }

    const reviewDate = new Date().toISOString().split('T')[0];
    const reviewerLabel = `${reviewer.name} (${reviewer.role === 'admin' ? 'HR Director' : 'Manager'})`;

    if (isDbConnected()) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { id };

      const updated = await LeaveRequestModel.findOneAndUpdate(
        query,
        {
          $set: {
            status,
            reviewedBy: reviewerLabel,
            reviewDate,
            reviewNote: reviewNote || (status === 'Approved' ? 'Approved by leadership.' : 'Declined.')
          }
        },
        { new: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Leave request not found' });
        return;
      }

      await ActivityModel.create({
        type: status === 'Approved' ? 'leave_approved' : 'leave_rejected',
        title: `Leave ${status}`,
        description: `${updated.employeeName}'s ${updated.leaveType} leave request was ${status.toLowerCase()}`,
        actor: reviewer.name
      });

      res.json({ success: true, message: `Leave request ${status.toLowerCase()}`, leave: updated });
    } else {
      const idx = memoryStore.leaves.findIndex((l) => l.id === id || l._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Leave request not found' });
        return;
      }

      memoryStore.leaves[idx] = {
        ...memoryStore.leaves[idx],
        status,
        reviewedBy: reviewerLabel,
        reviewDate,
        reviewNote: reviewNote || (status === 'Approved' ? 'Approved by leadership.' : 'Declined.')
      };

      const updated = memoryStore.leaves[idx];

      memoryStore.activities.unshift({
        id: `act_${Date.now()}`,
        _id: `act_${Date.now()}`,
        type: status === 'Approved' ? 'leave_approved' : 'leave_rejected',
        title: `Leave ${status}`,
        description: `${updated.employeeName}'s ${updated.leaveType} leave was ${status.toLowerCase()}`,
        timestamp: 'Just now',
        actor: reviewer.name
      });

      res.json({ success: true, message: `Leave request ${status.toLowerCase()}`, leave: updated });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
