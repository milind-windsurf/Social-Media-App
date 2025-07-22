'use client';

import { Sidebar } from './Sidebar';

/**
 * MainLayout component that wraps content with the sidebar
 * This component ensures the sidebar is persistent across all pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 * @returns {JSX.Element} Layout with sidebar and main content
 */
export function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="ml-64 w-[calc(100%-16rem)]">
        <div className="w-full max-w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
