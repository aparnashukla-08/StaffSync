/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { EmployeeManagementPage } from './components/employees/EmployeeManagementPage';
import { AttendancePage } from './components/attendance/AttendancePage';
import { LeaveManagementPage } from './components/leaves/LeaveManagementPage';
import { EmployeeDirectoryPage } from './components/directory/EmployeeDirectoryPage';
import { AnnouncementsPage } from './components/announcements/AnnouncementsPage';
import { MyProfilePage } from './components/profile/MyProfilePage';
import { LoginPage } from './components/auth/LoginPage';
import { BackendGuideModal } from './components/backend-guide/BackendGuideModal';
import { ToastContainer } from './components/ui/Toast';
import { EmployeeModal } from './components/employees/EmployeeModal';
import { ApplyLeaveModal } from './components/leaves/ApplyLeaveModal';
import { AnnouncementModal } from './components/announcements/AnnouncementModal';

const AppContent: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    addEmployee,
    applyLeave,
    addAnnouncement
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global action modal states triggered from dashboard shortcuts
  const [globalAddEmployeeOpen, setGlobalAddEmployeeOpen] = useState(false);
  const [globalApplyLeaveOpen, setGlobalApplyLeaveOpen] = useState(false);
  const [globalAnnouncementOpen, setGlobalAnnouncementOpen] = useState(false);

  // If user explicitly navigates to login or has no active session
  if (currentPage === 'login' || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <LoginPage />
        <BackendGuideModal />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onOpenAddEmployee={() => setGlobalAddEmployeeOpen(true)}
              onOpenApplyLeave={() => setGlobalApplyLeaveOpen(true)}
              onOpenNewAnnouncement={() => setGlobalAnnouncementOpen(true)}
            />
          )}

          {currentPage === 'employees' && <EmployeeManagementPage />}

          {currentPage === 'attendance' && <AttendancePage />}

          {currentPage === 'leaves' && <LeaveManagementPage />}

          {currentPage === 'directory' && <EmployeeDirectoryPage />}

          {currentPage === 'announcements' && <AnnouncementsPage />}

          {currentPage === 'profile' && <MyProfilePage />}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <EmployeeModal
        isOpen={globalAddEmployeeOpen}
        onClose={() => setGlobalAddEmployeeOpen(false)}
        onSave={addEmployee}
      />

      <ApplyLeaveModal
        isOpen={globalApplyLeaveOpen}
        onClose={() => setGlobalApplyLeaveOpen(false)}
        onApply={applyLeave}
      />

      <AnnouncementModal
        isOpen={globalAnnouncementOpen}
        onClose={() => setGlobalAnnouncementOpen(false)}
        onPublish={addAnnouncement}
      />

      {/* Backend & DB Integration Guide Modal */}
      <BackendGuideModal />

      {/* Notification Toast Layer */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
