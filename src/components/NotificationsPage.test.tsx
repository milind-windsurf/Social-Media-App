import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsPage } from './NotificationsPage';
import { Notification } from '@/types';

// Mock the useState and useEffect hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn()
}));

describe('NotificationsPage', () => {
  const mockSetNotifications = jest.fn();
  const mockSetActiveFilter = jest.fn();
  const mockSetLoading = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock useState for each state variable
    const { useState } = require('react');
    useState.mockImplementation((initialValue: any) => {
      if (Array.isArray(initialValue)) return [[] as Notification[], mockSetNotifications];
      if (initialValue === 'all') return ['all', mockSetActiveFilter];
      if (initialValue === true) return [false, mockSetLoading];
      return [initialValue, jest.fn()];
    });
    
    // Mock useEffect to execute the callback immediately
    const { useEffect } = require('react');
    useEffect.mockImplementation((cb: any) => cb());
  });
  
  test('renders notifications page with title', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
  
  test('renders filter tabs', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Mentions')).toBeInTheDocument();
    expect(screen.getByText('Likes')).toBeInTheDocument();
    expect(screen.getByText('Follows')).toBeInTheDocument();
  });
  
  test('shows loading state initially', () => {
    const { useEffect } = require('react');
    useEffect.mockImplementation(() => {});
    
    const { useState } = require('react');
    useState.mockImplementationOnce(() => [[] as Notification[], mockSetNotifications])
      .mockImplementationOnce(() => ['all', mockSetActiveFilter])
      .mockImplementationOnce(() => [true, mockSetLoading]);
    
    render(<NotificationsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
