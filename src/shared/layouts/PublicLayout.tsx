import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../../components/layout/Header/PublicHeader';
import Footer from '../../components/layout/Footer/Footer';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PublicHeader />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};