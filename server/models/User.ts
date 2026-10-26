import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  employeeId: string;
  designation: string;
  department: string;
  avatar: string;
  phone: string;
  address: string;
  joinedDate: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
    employeeId: { type: String, required: true, unique: true, trim: true },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    bio: { type: String, default: '' }
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
