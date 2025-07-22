'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

/**
 * Props for MainLayout component
 */
interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout component that wraps content with the sidebar
 * This component ensures the sidebar is persistent across all pages
 * 
 * @param {MainLayoutProps} props - Component props
 * @returns {JSX.Element} Layout with sidebar and main content
 */
export function MainLayout({ children }: MainLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="ml-64">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
