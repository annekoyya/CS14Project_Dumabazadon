import React, { useEffect, useState } from 'react';
import Navbar from '@/Components/Navbar';
import Sidebar from '@/Components/Sidebar';
import '../../css/app.css';
import { Inertia } from '@inertiajs/inertia';

// Session Timeout Warning Component
export const SessionTimeoutWarning = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const sessionLifetime = 30 * 60 * 1000; // 30 minutes
    const warningTime = 1 * 60 * 1000; // 1 min before logout

    const warningTimer = setTimeout(() => setShowWarning(true), sessionLifetime - warningTime);
    const logoutTimer = setTimeout(() => Inertia.visit('/logout'), sessionLifetime);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="mb-4">Your session will expire in 1 minute due to inactivity.</p>
        <button
          onClick={() => setShowWarning(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Continue Session
        </button>
      </div>
    </div>
  );
};

// Layout Component
const Layout = ({ children, className, page_title }) => {
  return (
    <div 
      className="h-screen flex bg-[--color-2] bg-cover bg-center" 
      style={{ backgroundImage: "url('/images/new_bg.jpg')" }}
    >
      <Sidebar className="border border-[--color-5] my-5 ml-5 bg-[--color-1] fixed" />
      
      <main
        className={`flex-1 p-5 h-full flex flex-col z-0 overflow-y-auto ${className}`}
      >
        <Navbar
          page_title={page_title}
          className="transparent w-full h-16 flex justify-end items-center"
        />
        {children}
        <SessionTimeoutWarning />
      </main>
    </div>
  );
};

export default Layout;