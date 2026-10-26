import mongoose, { Schema, Document } from 'mongoose';

export type AnnouncementCategory = 'Company' | 'Policy' | 'Event' | 'Holiday' | 'Alert';
export type AnnouncementPriority = 'Normal' | 'High' | 'Urgent';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  author: string;
  authorRole: string;
  date: string;
  isPinned: boolean;
  readBy: string[]; // employeeIds
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Company', 'Policy', 'Event', 'Holiday', 'Alert'],
      default: 'Company'
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal'
    },
    author: { type: String, required: true, trim: true },
    authorRole: { type: String, default: 'Human Resources' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    isPinned: { type: Boolean, default: false },
    readBy: [{ type: String }]
  },
  { timestamps: true }
);

export const AnnouncementModel =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
