import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  employeeId: string;
  name: string;
  department: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'staffsync_secure_development_jwt_secret_2026';

export const generateToken = (user: {
  _id?: unknown;
  id?: string;
  email: string;
  role: UserRole;
  employeeId: string;
  name: string;
  department: string;
}): string => {
  const payload: AuthUser = {
    id: String(user._id || user.id),
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    name: user.name,
    department: user.department
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied: No authorization token provided'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    res.status(401).json({
      success: false,
      message: `Invalid or expired authorization token (${message})`
    });
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: This action requires [${roles.join(' or ')}] privilege. Your role is '${req.user.role}'.`
      });
      return;
    }

    next();
  };
};
