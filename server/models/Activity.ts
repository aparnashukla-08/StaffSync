import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType =
  | 'check_in'
  | 'leave_applied'
  | 'leave_approved'
  | 'leave_rejected'
  | 'employee_added'
  | 'employee_updated'
  | 'announcement';

export interface IActivity extends Document {
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, default: 'Just now' },
    actor: { type: String, required: true }
  },
  { timestamps: true }
);

export const ActivityModel =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
