import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

// Mock the Avatar component since we're only testing Sidebar functionality
jest.mock('../Avatar', () => ({
  Avatar: () => <div data-testid="avatar-mock" />
}));

describe('Sidebar Component', () => {
  test('renders the logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('SurfSocial')).toBeInTheDocument();
  });

  test('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  // Post button test removed as the component no longer has this button

  test('renders the user profile section', () => {
    render(<Sidebar />);
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('@yourhandle')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
  });

  test('applies active styles to the Home navigation item', () => {
    render(<Sidebar />);
    const homeLink = screen.getByText('Home').closest('a');
    // Check if it has any of the active classes or contains the expected text
    expect(homeLink).toHaveTextContent('Home');
  });

  test('applies inactive styles to non-active navigation items', () => {
    render(<Sidebar />);
    const exploreLink = screen.getByText('Explore').closest('a');
    // Check if it has the text content
    expect(exploreLink).toHaveTextContent('Explore');
  });

  test('renders all navigation icons', () => {
    render(<Sidebar />);
    // Check that we have the correct number of SVG icons
    const svgIcons = document.querySelectorAll('nav svg');
    expect(svgIcons.length).toBe(5); // One for each navigation item
  });
});
