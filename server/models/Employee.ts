import mongoose, { Schema, Document } from 'mongoose';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  status: EmployeeStatus;
  phone: string;
  joinedDate: string;
  salary: number;
  manager: string;
  workLocation: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  skills: string[];
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    designation: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      enum: ['Engineering', 'Product', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Operations', 'Legal'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active'
    },
    phone: { type: String, required: true, trim: true },
    joinedDate: { type: String, required: true, default: () => new Date().toISOString().split('T')[0] },
    salary: { type: Number, required: true, min: 0 },
    manager: { type: String, default: 'Executive Board' },
    workLocation: { type: String, default: 'San Francisco HQ' },
    address: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    skills: [{ type: String }],
    avatar: { type: String, default: '' }
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
