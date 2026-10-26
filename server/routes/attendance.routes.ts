import { Router, Response } from 'express';
import { AttendanceModel } from '../models/Attendance';
import { ActivityModel } from '../models/Activity';
import { verifyToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';
import { isDbConnected, memoryStore } from '../db';

const router = Router();

// GET /api/attendance - List attendance records with filtering
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, department, status, employeeId, search } = req.query;

    if (isDbConnected()) {
      const query: any = {};

      if (date) query.date = date;
      if (department && department !== 'All') query.department = department;
      if (status && status !== 'All') query.status = status;
      if (employeeId) query.employeeId = employeeId;

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim();
        query.$or = [
          { employeeName: { $regex: s, $options: 'i' } },
          { employeeId: { $regex: s, $options: 'i' } }
        ];
      }

      const records = await AttendanceModel.find(query).sort({ date: -1, createdAt: -1 });
      res.json({ success: true, count: records.length, attendance: records });
    } else {
      let filtered = [...memoryStore.attendance];

      if (date) filtered = filtered.filter((r) => r.date === date);
      if (department && department !== 'All') filtered = filtered.filter((r) => r.department === department);
      if (status && status !== 'All') filtered = filtered.filter((r) => r.status === status);
      if (employeeId) filtered = filtered.filter((r) => r.employeeId === employeeId);

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (r) => r.employeeName.toLowerCase().includes(s) || r.employeeId.toLowerCase().includes(s)
        );
      }

      res.json({ success: true, count: filtered.length, attendance: filtered });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/attendance/today - Get authenticated user's record today
router.get('/today', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const userEmpId = req.user?.employeeId;

    if (!userEmpId) {
      res.status(400).json({ success: false, message: 'User has no employee ID' });
      return;
    }

    if (isDbConnected()) {
      const record = await AttendanceModel.findOne({ employeeId: userEmpId, date: todayStr });
      res.json({ success: true, record });
    } else {
      const record = memoryStore.attendance.find(
        (r) => r.employeeId === userEmpId && r.date === todayStr
      );
      res.json({ success: true, record: record || null });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/check-in - Record punch-in for today
router.post('/check-in', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const { notes = 'Checked in via web portal' } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine status (Late if arrival is past 9:15 AM)
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const status = isLate ? 'Late' : 'Present';

    if (isDbConnected()) {
      // Check if already checked in today
      const existing = await AttendanceModel.findOne({ employeeId: user.employeeId, date: todayStr });

      if (existing) {
        if (existing.checkIn) {
          res.status(400).json({
            success: false,
            message: `You are already checked in today at ${existing.checkIn}.`,
            record: existing
          });
          return;
        }

        existing.checkIn = timeStr;
        existing.status = status;
        if (notes) existing.notes = notes;
        await existing.save();

        res.json({ success: true, message: `Checked in at ${timeStr}`, record: existing });
        return;
      }

      const newRecord = await AttendanceModel.create({
        employeeId: user.employeeId,
        employeeName: user.name,
        department: user.department,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null,
        status,
        workHours: 0,
        notes
      });

      await ActivityModel.create({
        type: 'check_in',
        title: 'Attendance Recorded',
        description: `${user.name} checked in at ${timeStr}`,
        actor: user.name
      });

      res.status(201).json({ success: true, message: `Checked in at ${timeStr}`, record: newRecord });
    } else {
      const existing = memoryStore.attendance.find(
        (r) => r.employeeId === user.employeeId && r.date === todayStr
      );

      if (existing) {
        if (existing.checkIn) {
          res.status(400).json({
            success: false,
            message: `You are already checked in today at ${existing.checkIn}.`,
            record: existing
          });
          return;
        }
        existing.checkIn = timeStr;
        existing.status = status;
        existing.notes = notes;

        res.json({ success: true, message: `Checked in at ${timeStr}`, record: existing });
        return;
      }

      const newRecord = {
        id: `att_${Date.now()}`,
        _id: `att_${Date.now()}`,
        employeeId: user.employeeId,
        employeeName: user.name,
        department: user.department,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null,
        status,
        workHours: 0,
        notes
      };

      memoryStore.attendance.unshift(newRecord);

      memoryStore.activities.unshift({
        id: `act_${Date.now()}`,
        _id: `act_${Date.now()}`,
        type: 'check_in',
        title: 'Attendance Recorded',
        description: `${user.name} checked in at ${timeStr}`,
        timestamp: 'Just now',
        actor: user.name
      });

      res.status(201).json({ success: true, message: `Checked in at ${timeStr}`, record: newRecord });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/check-out - Record punch-out for today
router.post('/check-out', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isDbConnected()) {
      const record = await AttendanceModel.findOne({ employeeId: user.employeeId, date: todayStr });

      if (!record || !record.checkIn) {
        res.status(400).json({
          success: false,
          message: 'Cannot check out before checking in for today.'
        });
        return;
      }

      if (record.checkOut) {
        res.status(400).json({
          success: false,
          message: `Already checked out today at ${record.checkOut}.`,
          record
        });
        return;
      }

      record.checkOut = timeStr;
      record.workHours = record.workHours > 0 ? record.workHours : 8.0;
      await record.save();

      res.json({ success: true, message: `Checked out at ${timeStr}`, record });
    } else {
      const record = memoryStore.attendance.find(
        (r) => r.employeeId === user.employeeId && r.date === todayStr
      );

      if (!record || !record.checkIn) {
        res.status(400).json({
          success: false,
          message: 'Cannot check out before checking in for today.'
        });
        return;
      }

      if (record.checkOut) {
        res.status(400).json({
          success: false,
          message: `Already checked out today at ${record.checkOut}.`,
          record
        });
        return;
      }

      record.checkOut = timeStr;
      record.workHours = record.workHours > 0 ? record.workHours : 8.0;

      res.json({ success: true, message: `Checked out at ${timeStr}`, record });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/attendance/manual - Admin or Manager: Manual attendance entry
router.post('/manual', verifyToken, requireRoles('admin', 'manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeId, employeeName, department, date, checkIn, checkOut, status = 'Present', workHours = 8, notes = 'Manual entry' } = req.body;

    if (!employeeId || !date) {
      res.status(400).json({ success: false, message: 'Employee ID and date are required.' });
      return;
    }

    if (isDbConnected()) {
      // Upsert attendance entry
      const record = await AttendanceModel.findOneAndUpdate(
        { employeeId, date },
        {
          $set: {
            employeeName,
            department,
            checkIn: status === 'Absent' ? null : checkIn,
            checkOut: status === 'Absent' ? null : checkOut,
            status,
            workHours: status === 'Absent' ? 0 : Number(workHours),
            notes
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      res.json({ success: true, message: `Attendance saved for ${employeeName}`, record });
    } else {
      const existingIdx = memoryStore.attendance.findIndex(
        (r) => r.employeeId === employeeId && r.date === date
      );

      const recordData = {
        id: existingIdx !== -1 ? memoryStore.attendance[existingIdx].id : `att_${Date.now()}`,
        _id: existingIdx !== -1 ? memoryStore.attendance[existingIdx]._id : `att_${Date.now()}`,
        employeeId,
        employeeName,
        department,
        date,
        checkIn: status === 'Absent' ? null : checkIn,
        checkOut: status === 'Absent' ? null : checkOut,
        status,
        workHours: status === 'Absent' ? 0 : Number(workHours),
        notes
      };

      if (existingIdx !== -1) {
        memoryStore.attendance[existingIdx] = recordData;
      } else {
        memoryStore.attendance.unshift(recordData);
      }

      res.json({ success: true, message: `Attendance saved for ${employeeName}`, record: recordData });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
