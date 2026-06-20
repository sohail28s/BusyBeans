import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import PageLoader from '../Hooks/PageLoader';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
      <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
        
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
          
          <div className="sticky top-0 z-40 w-full shadow-sm bg-white">
            <TopNavbar toggleSidebar={toggleSidebar} />
          </div>

          <main className="flex-1 relative">
            <div className="w-full mx-auto">
              <PageLoader />
              <Outlet />
            </div>
          </main>

        </div>
      </div>
  );
};

export default MainLayout;

