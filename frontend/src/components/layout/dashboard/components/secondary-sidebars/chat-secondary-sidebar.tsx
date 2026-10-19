import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import { ChatSideNav } from '@/components/layout/dashboard/components/secondary-sidebars/secondary-sidenavs/chat-sidenav';

const ChatSecondarySidebar: React.FC = () => {
  return (
    <div className="flex h-screen border-collapse overflow-y-hidden">
      <ChatSideNav />
      <div className="chat-content w-full drop-shadow-[0_0px_4px_rgba(0,0,0,0.25)]">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatSecondarySidebar;
