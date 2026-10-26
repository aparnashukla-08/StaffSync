import mongoose, { Schema, Document } from 'mongoose';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day';

export interface IAttendance extends Document {
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workHours: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: String, required: true, index: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    checkIn: { type: String, default: null },
    checkOut: { type: String, default: null },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Half Day'],
      default: 'Present'
    },
    workHours: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same employee on the same date
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
