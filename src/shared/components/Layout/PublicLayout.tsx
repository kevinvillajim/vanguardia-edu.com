import React from 'react';
import PublicHeader from '../../../components/layout/Header/PublicHeader';
import Footer from '../../../components/layout/Footer/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      {/* Main content with top padding to account for fixed header */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicLayout;