'use client';

import { Avatar } from './Avatar';
import { UserSettingsMenu } from './UserSettingsMenu';
import { useState, MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation item type
 */
interface NavigationItem {
  name: string;
  icon: string;
  path: string;
}

/**
 * Sidebar navigation component for the social media app
 */
export const Sidebar = (): React.ReactElement => {
  // State to control the visibility of the settings menu
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();

  /**
   * Toggle settings menu visibility
   */
  const toggleSettingsMenu = (e: MouseEvent): void => {
    e.stopPropagation();
    setIsSettingsMenuOpen(!isSettingsMenuOpen);
  };

  /**
   * Close settings menu when clicking outside
   */
  const closeSettingsMenu = (): void => {
    setIsSettingsMenuOpen(false);
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Home', icon: 'home', path: '/' },
    { name: 'Explore', icon: 'search', path: '/explore' },
    { name: 'Notifications', icon: 'bell', path: '/notifications' },
    { name: 'Messages', icon: 'mail', path: '/messages' },
    { name: 'Profile', icon: 'user', path: '/profile' },
  ];

  /**
   * Render icon based on icon name
   * @param {string} iconName - Name of the icon to render
   * @param {boolean} active - Whether the icon should be in active state
   * @returns {React.ReactElement | null} The icon component
   */
  const renderIcon = (iconName: string, active = false): React.ReactElement | null => {
    const className = `w-6 h-6 ${active ? 'stroke-2' : 'stroke-1.5'}`;
    
    switch (iconName) {
      case 'home':
        return (
          <svg className={className} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'search':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        );
      case 'bell':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        );
      case 'mail':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        );
      case 'user':
        return (
          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-4 fixed left-0 top-0">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wave part of the logo */}
            <path d="M3 12C5 10 7 14 9 12C11 10 13 14 15 12C17 10 19 14 21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Sun/circle above the wave */}
            <circle cx="18" cy="7" r="3" fill="currentColor" />
          </svg>
          <h1 className="text-2xl font-righteous text-blue-500 ml-2 tracking-wider">SurfSocial</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path as `/` | `/explore` | `/notifications` | `/messages` | `/profile`}
              className={`w-full flex items-center space-x-4 px-4 py-3 rounded-full text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {renderIcon(item.icon, isActive)}
              <span className="text-lg">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="absolute bottom-4 left-4 right-4">
        <div 
          className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={toggleSettingsMenu}
          aria-expanded={isSettingsMenuOpen}
          aria-haspopup="true"
          aria-label="User settings menu"
          data-component-name="Sidebar"
        >
          <Avatar 
            name="Your Name"
            size="sm"
            className="w-10 h-10"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate" data-component-name="Sidebar">Your Name</p>
            <p className="text-sm text-gray-500 truncate" data-component-name="Sidebar">@yourhandle</p>
          </div>
        </div>
        
        {/* User settings menu popup */}
        <UserSettingsMenu isOpen={isSettingsMenuOpen} onClose={closeSettingsMenu} />
      </div>
    </div>
  );
};
