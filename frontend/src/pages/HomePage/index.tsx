import Sidebar from '@/components/layout/dashboard/components/primary-sidebar/sidebar';
import { selectToken } from '@/redux/slices/authSlice';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom'; // Import Outlet

const HomePage: React.FC = () => {
  const token = useSelector(selectToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
    } else {
      navigate('/login');
      console.log('NO TOKEN FOUND');
    }
  }, [token]);
  return (
    <div className="flex bg-gradient h-screen border-collapse overflow-y-hidden">
      <Sidebar token={token} />
      <main className="flex-1 bg-white opacity-90 overflow-x-hidden bg-gradient">
        <Outlet />
      </main>
    </div>
  );
};

export default HomePage;
