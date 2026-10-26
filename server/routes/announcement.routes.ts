import { Router, Response } from 'express';
import { AnnouncementModel } from '../models/Announcement';
import { ActivityModel } from '../models/Activity';
import { verifyToken, requireRoles, AuthenticatedRequest } from '../middleware/auth';
import { isDbConnected, memoryStore } from '../db';

const router = Router();

// GET /api/announcements
router.get('/', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, search } = req.query;

    if (isDbConnected()) {
      const query: any = {};
      if (category && category !== 'All') query.category = category;

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim();
        query.$or = [
          { title: { $regex: s, $options: 'i' } },
          { content: { $regex: s, $options: 'i' } },
          { author: { $regex: s, $options: 'i' } }
        ];
      }

      const announcements = await AnnouncementModel.find(query).sort({ isPinned: -1, createdAt: -1 });
      res.json({ success: true, count: announcements.length, announcements });
    } else {
      let filtered = [...memoryStore.announcements];

      if (category && category !== 'All') {
        filtered = filtered.filter((a) => a.category === category);
      }

      if (search && typeof search === 'string' && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(s) ||
            a.content.toLowerCase().includes(s) ||
            a.author.toLowerCase().includes(s)
        );
      }

      filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      res.json({ success: true, count: filtered.length, announcements: filtered });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/announcements - Admin or Manager
router.post('/', verifyToken, requireRoles('admin', 'manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, category = 'Company', priority = 'Normal', isPinned = false } = req.body;
    const user = req.user!;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required.' });
      return;
    }

    if (isDbConnected()) {
      const announcement = await AnnouncementModel.create({
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        author: user.name,
        authorRole: user.role === 'admin' ? 'HR Director' : 'Engineering Lead',
        date: new Date().toISOString().split('T')[0],
        isPinned: Boolean(isPinned),
        readBy: [user.employeeId]
      });

      await ActivityModel.create({
        type: 'announcement',
        title: 'Announcement Published',
        description: `"${title}" posted by ${user.name}`,
        actor: user.name
      });

      res.status(201).json({ success: true, message: 'Announcement published', announcement });
    } else {
      const newId = `ann_${Date.now()}`;
      const newAnn = {
        id: newId,
        _id: newId,
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        author: user.name,
        authorRole: user.role === 'admin' ? 'HR Director' : 'Engineering Lead',
        date: new Date().toISOString().split('T')[0],
        isPinned: Boolean(isPinned),
        readBy: [user.employeeId]
      };

      memoryStore.announcements.unshift(newAnn);

      memoryStore.activities.unshift({
        id: `act_${Date.now()}`,
        _id: `act_${Date.now()}`,
        type: 'announcement',
        title: 'Announcement Published',
        description: `"${title}" posted by ${user.name}`,
        timestamp: 'Just now',
        actor: user.name
      });

      res.status(201).json({ success: true, message: 'Announcement published', announcement: newAnn });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/announcements/:id - Admin or Manager
router.put('/:id', verifyToken, requireRoles('admin', 'manager'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, isPinned } = req.body;

    if (isDbConnected()) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { id };

      const updated = await AnnouncementModel.findOneAndUpdate(
        query,
        { $set: { title, content, category, priority, isPinned } },
        { new: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Announcement not found' });
        return;
      }

      res.json({ success: true, message: 'Announcement updated', announcement: updated });
    } else {
      const idx = memoryStore.announcements.findIndex((a) => a.id === id || a._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Announcement not found' });
        return;
      }

      memoryStore.announcements[idx] = {
        ...memoryStore.announcements[idx],
        title,
        content,
        category,
        priority,
        isPinned
      };

      res.json({ success: true, message: 'Announcement updated', announcement: memoryStore.announcements[idx] });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/announcements/:id - Admin only
router.delete('/:id', verifyToken, requireRoles('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { id };

      const deleted = await AnnouncementModel.findOneAndDelete(query);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Announcement not found' });
        return;
      }
      res.json({ success: true, message: 'Announcement deleted' });
    } else {
      const idx = memoryStore.announcements.findIndex((a) => a.id === id || a._id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Announcement not found' });
        return;
      }

      memoryStore.announcements.splice(idx, 1);
      res.json({ success: true, message: 'Announcement deleted' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/announcements/:id/read - Mark as read
router.patch('/:id/read', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const empId = req.user?.employeeId;

    if (!empId) {
      res.status(400).json({ success: false, message: 'Missing employee ID' });
      return;
    }

    if (isDbConnected()) {
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { id };

      const updated = await AnnouncementModel.findOneAndUpdate(
        query,
        { $addToSet: { readBy: empId } },
        { new: true }
      );

      res.json({ success: true, announcement: updated });
    } else {
      const ann = memoryStore.announcements.find((a) => a.id === id || a._id === id);
      if (ann && !ann.readBy.includes(empId)) {
        ann.readBy.push(empId);
      }
      res.json({ success: true, announcement: ann });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
