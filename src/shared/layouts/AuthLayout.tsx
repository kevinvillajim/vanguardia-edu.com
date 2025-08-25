import React from 'react';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children || <Outlet />}
        </div>
      </div>
      
      {/* Right side - Brand/Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">VanguardIA</h1>
              <p className="text-xl opacity-90">Plataforma Educativa del Futuro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};