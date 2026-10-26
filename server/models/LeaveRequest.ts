import mongoose, { Schema, Document } from 'mongoose';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Annual' | 'Sick' | 'Casual' | 'Maternity' | 'Unpaid';

export interface ILeaveRequest extends Document {
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNote?: string;
  emergencyPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: String, required: true, index: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    leaveType: {
      type: String,
      required: true,
      enum: ['Annual', 'Sick', 'Casual', 'Maternity', 'Unpaid']
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    appliedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    reviewedBy: { type: String, default: '' },
    reviewDate: { type: String, default: '' },
    reviewNote: { type: String, default: '' },
    emergencyPhone: { type: String, default: '' }
  },
  { timestamps: true }
);

export const LeaveRequestModel =
  mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
