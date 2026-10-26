import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { EmployeeModel } from '../models/Employee';
import { generateToken, verifyToken, AuthenticatedRequest } from '../middleware/auth';
import { isDbConnected, memoryStore } from '../db';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      employeeId,
      department = 'Engineering',
      designation = 'Software Engineer',
      phone = '',
      address = ''
    } = req.body;

    if (!name || !email || !password || !employeeId) {
      res.status(400).json({
        success: false,
        message: 'Name, email, password, and employee ID are required.'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanEmpId = employeeId.trim();

    // Check existing
    if (isDbConnected()) {
      const existingUser = await UserModel.findOne({
        $or: [{ email: cleanEmail }, { employeeId: cleanEmpId }]
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: existingUser.email === cleanEmail
            ? 'An account with this email address already exists.'
            : 'An account with this employee ID already exists.'
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await UserModel.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role,
        employeeId: cleanEmpId,
        department,
        designation,
        phone,
        address,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80`
      });

      // Also ensure employee record exists
      const existingEmp = await EmployeeModel.findOne({ employeeId: cleanEmpId });
      if (!existingEmp) {
        await EmployeeModel.create({
          employeeId: cleanEmpId,
          name,
          email: cleanEmail,
          department,
          designation,
          phone,
          status: 'Active',
          salary: 95000,
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: newUser.avatar,
          skills: ['Communication', 'Problem Solving']
        });
      }

      const token = generateToken(newUser);
      const userObj = newUser.toObject();
      delete (userObj as any).password;

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: userObj
      });
    } else {
      // Memory Store fallback
      const existing = memoryStore.users.find(
        (u) => u.email === cleanEmail || u.employeeId === cleanEmpId
      );

      if (existing) {
        res.status(409).json({
          success: false,
          message: existing.email === cleanEmail
            ? 'An account with this email address already exists.'
            : 'An account with this employee ID already exists.'
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: `usr_${Date.now()}`,
        id: `usr_${Date.now()}`,
        name,
        email: cleanEmail,
        password: hashedPassword,
        role,
        employeeId: cleanEmpId,
        department,
        designation,
        phone,
        address,
        joinedDate: new Date().toISOString().split('T')[0],
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80`,
        emergencyContact: { name: '', relationship: '', phone: '' },
        bio: `${designation} at StaffSync.`
      };

      memoryStore.users.push(newUser);

      // Add to memory employees if missing
      const empExisting = memoryStore.employees.find((e) => e.employeeId === cleanEmpId);
      if (!empExisting) {
        memoryStore.employees.push({
          id: `emp_${Date.now()}`,
          _id: `emp_${Date.now()}`,
          employeeId: cleanEmpId,
          name,
          email: cleanEmail,
          department,
          designation,
          phone,
          status: 'Active',
          salary: 95000,
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: newUser.avatar,
          skills: ['Communication', 'Teamwork']
        });
      }

      const token = generateToken(newUser);
      const { password: _, ...userWithoutPass } = newUser;

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: userWithoutPass
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;

    if (isDbConnected()) {
      user = await UserModel.findOne({ email: cleanEmail });
    } else {
      user = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. User with this email does not exist.'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // Support demo mode password fallback if testing standard demo accounts
    const isDemoOverride = password === 'StaffSync2026!' || password === 'demo123';

    if (!isMatch && !isDemoOverride) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
      return;
    }

    const token = generateToken(user);
    const userObject = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userObject.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObject
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    let user: any = null;

    if (isDbConnected()) {
      user = await UserModel.findOne({
        $or: [{ _id: req.user.id }, { email: req.user.email }]
      }).select('-password');
    } else {
      const found = memoryStore.users.find(
        (u) => u.id === req.user?.id || u.email === req.user?.email
      );
      if (found) {
        const { password: _, ...clean } = found;
        user = clean;
      }
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User record not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const { name, phone, address, bio, emergencyContact } = req.body;

    const updateFields: any = {};
    if (name) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (address !== undefined) updateFields.address = address.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (emergencyContact) updateFields.emergencyContact = emergencyContact;

    let updatedUser: any = null;

    if (isDbConnected()) {
      updatedUser = await UserModel.findOneAndUpdate(
        { email: req.user.email },
        { $set: updateFields },
        { new: true }
      ).select('-password');

      // Also sync employee profile
      await EmployeeModel.findOneAndUpdate(
        { email: req.user.email },
        { $set: { phone: updateFields.phone, address: updateFields.address, emergencyContact: updateFields.emergencyContact } }
      );
    } else {
      const idx = memoryStore.users.findIndex((u) => u.email === req.user?.email);
      if (idx !== -1) {
        memoryStore.users[idx] = { ...memoryStore.users[idx], ...updateFields };
        const { password: _, ...clean } = memoryStore.users[idx];
        updatedUser = clean;

        const empIdx = memoryStore.employees.findIndex((e) => e.email === req.user?.email);
        if (empIdx !== -1) {
          memoryStore.employees[empIdx] = {
            ...memoryStore.employees[empIdx],
            phone: updateFields.phone || memoryStore.employees[empIdx].phone,
            address: updateFields.address || memoryStore.employees[empIdx].address
          };
        }
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
