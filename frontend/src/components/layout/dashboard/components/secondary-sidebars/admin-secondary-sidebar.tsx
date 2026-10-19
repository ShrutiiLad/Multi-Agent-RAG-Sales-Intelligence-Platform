import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import { AdminSideNav } from '@/components/layout/dashboard/components/secondary-sidebars/secondary-sidenavs/admin-sidenav';

const AdminSecondarySidebar: React.FC = () => {
  return (
    <div className="flex h-screen border-collapse overflow-y-hidden">
      <AdminSideNav />
      <div className="chat-content w-full bg-white rounded-tl-[10px] drop-shadow-[0_0px_4px_rgba(0,0,0,0.25)]">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminSecondarySidebar;
