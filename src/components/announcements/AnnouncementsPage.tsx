import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Announcement, AnnouncementCategory } from '../../types';
import { AnnouncementModal } from './AnnouncementModal';
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Tag,
  Eye,
  X
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, addAnnouncement, markAnnouncementAsRead, currentUser } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const categories = ['All', 'Company', 'Policy', 'Event', 'Holiday', 'Alert'];

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesCategory = activeCategory === 'All' || ann.category === activeCategory;
      const matchesSearch =
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [announcements, activeCategory, searchQuery]);

  const canPublish = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const handleOpenAnnouncement = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    markAnnouncementAsRead(ann.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Company Announcements & Bulletins</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal corporate news, policy changes, holiday schedules, and event invitations
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Publish Announcement
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notices by keyword, policy name, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 shadow-2xs">
            <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-slate-600 text-sm">No announcements found</p>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing search.</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isRead = currentUser ? ann.readBy.includes(currentUser.employeeId) : true;
            return (
              <div
                key={ann.id}
                onClick={() => handleOpenAnnouncement(ann)}
                className={`bg-white border rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all cursor-pointer ${
                  ann.isPinned ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded">
                        <Pin className="w-3 h-3 text-blue-600" /> Pinned
                      </span>
                    )}

                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {ann.category}
                    </span>

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        ann.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : ann.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>

                    {!isRead && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        New Notice
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono tabular-nums shrink-0">
                    {ann.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Posted by <strong className="text-slate-700 font-medium">{ann.author}</strong> ({ann.authorRole})
                  </span>

                  <span className="text-blue-600 font-medium flex items-center gap-1">
                    Read Full Notice →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Modal */}
      <AnnouncementModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={addAnnouncement}
      />

      {/* View Full Announcement Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {selectedAnnouncement.category}
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {selectedAnnouncement.date}
                </span>
              </div>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {selectedAnnouncement.title}
            </h3>

            <div className="mt-2 text-xs text-slate-500">
              Published by <strong className="text-slate-800">{selectedAnnouncement.author}</strong> · {selectedAnnouncement.authorRole}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {selectedAnnouncement.content}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Marked as Read
              </span>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
