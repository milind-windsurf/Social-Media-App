import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('./Avatar', () => ({
  Avatar: ({ name, size, className }: { name: string; size: string; className?: string }) => (
    <div data-testid="avatar" data-name={name} data-size={size} className={className}>
      Avatar
    </div>
  ),
}));

jest.mock('./UserSettingsMenu', () => ({
  UserSettingsMenu: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="user-settings-menu" onClick={onClose}>Settings Menu</div> : null
  ),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the sidebar', () => {
      render(<Sidebar />);
      expect(screen.getByText('SurfSocial')).toBeInTheDocument();
    });

    it('should render all navigation items', () => {
      render(<Sidebar />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should render the logo', () => {
      render(<Sidebar />);
      const logo = screen.getByText('SurfSocial');
      expect(logo).toHaveClass('text-2xl', 'font-righteous', 'text-blue-500');
    });

    it('should render user profile section', () => {
      render(<Sidebar />);
      expect(screen.getByText('Your Name')).toBeInTheDocument();
      expect(screen.getByText('@yourhandle')).toBeInTheDocument();
    });

    it('should render avatar in user profile section', () => {
      render(<Sidebar />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-name', 'Your Name');
      expect(avatar).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('navigation', () => {
    it('should highlight active route', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      render(<Sidebar />);
      
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('should not highlight inactive routes', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      render(<Sidebar />);
      
      const exploreLink = screen.getByText('Explore').closest('a');
      expect(exploreLink).not.toHaveClass('bg-blue-50', 'text-blue-600');
      expect(exploreLink).toHaveClass('text-gray-700');
    });

    it('should highlight explore route when active', () => {
      (usePathname as jest.Mock).mockReturnValue('/explore');
      render(<Sidebar />);
      
      const exploreLink = screen.getByText('Explore').closest('a');
      expect(exploreLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('should highlight notifications route when active', () => {
      (usePathname as jest.Mock).mockReturnValue('/notifications');
      render(<Sidebar />);
      
      const notificationsLink = screen.getByText('Notifications').closest('a');
      expect(notificationsLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('should highlight messages route when active', () => {
      (usePathname as jest.Mock).mockReturnValue('/messages');
      render(<Sidebar />);
      
      const messagesLink = screen.getByText('Messages').closest('a');
      expect(messagesLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('should highlight profile route when active', () => {
      (usePathname as jest.Mock).mockReturnValue('/profile');
      render(<Sidebar />);
      
      const profileLink = screen.getByText('Profile').closest('a');
      expect(profileLink).toHaveClass('bg-blue-50', 'text-blue-600');
    });

    it('should have correct href for each navigation item', () => {
      render(<Sidebar />);
      
      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
      expect(screen.getByText('Explore').closest('a')).toHaveAttribute('href', '/explore');
      expect(screen.getByText('Notifications').closest('a')).toHaveAttribute('href', '/notifications');
      expect(screen.getByText('Messages').closest('a')).toHaveAttribute('href', '/messages');
      expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/profile');
    });
  });

  describe('user settings menu', () => {
    it('should not show settings menu by default', () => {
      render(<Sidebar />);
      expect(screen.queryByTestId('user-settings-menu')).not.toBeInTheDocument();
    });

    it('should show settings menu when user profile is clicked', () => {
      render(<Sidebar />);
      
      const userProfile = screen.getByLabelText('User settings menu');
      fireEvent.click(userProfile);
      
      expect(screen.getByTestId('user-settings-menu')).toBeInTheDocument();
    });

    it('should close settings menu when clicked again', () => {
      render(<Sidebar />);
      
      const userProfile = screen.getByLabelText('User settings menu');
      fireEvent.click(userProfile);
      expect(screen.getByTestId('user-settings-menu')).toBeInTheDocument();
      
      fireEvent.click(userProfile);
      expect(screen.queryByTestId('user-settings-menu')).not.toBeInTheDocument();
    });

    it('should have proper aria attributes for user profile button', () => {
      render(<Sidebar />);
      
      const userProfile = screen.getByLabelText('User settings menu');
      expect(userProfile).toHaveAttribute('aria-haspopup', 'true');
      expect(userProfile).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when menu is opened', () => {
      render(<Sidebar />);
      
      const userProfile = screen.getByLabelText('User settings menu');
      fireEvent.click(userProfile);
      
      expect(userProfile).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('styling', () => {
    it('should have fixed positioning', () => {
      render(<Sidebar />);
      const sidebar = screen.getByText('SurfSocial').closest('div')?.parentElement;
      expect(sidebar).toHaveClass('fixed', 'left-0', 'top-0');
    });

    it('should have correct width', () => {
      render(<Sidebar />);
      const sidebar = screen.getByText('SurfSocial').closest('div')?.parentElement;
      expect(sidebar).toHaveClass('w-64');
    });

    it('should have full height', () => {
      render(<Sidebar />);
      const sidebar = screen.getByText('SurfSocial').closest('div')?.parentElement;
      expect(sidebar).toHaveClass('h-screen');
    });

    it('should have border on the right', () => {
      render(<Sidebar />);
      const sidebar = screen.getByText('SurfSocial').closest('div')?.parentElement;
      expect(sidebar).toHaveClass('border-r', 'border-gray-200');
    });

    it('should have white background', () => {
      render(<Sidebar />);
      const sidebar = screen.getByText('SurfSocial').closest('div')?.parentElement;
      expect(sidebar).toHaveClass('bg-white');
    });
  });

  describe('navigation item styling', () => {
    it('should have rounded-full class on navigation items', () => {
      render(<Sidebar />);
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('rounded-full');
    });

    it('should have hover effect on inactive navigation items', () => {
      (usePathname as jest.Mock).mockReturnValue('/explore');
      render(<Sidebar />);
      
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('hover:bg-gray-100');
    });

    it('should have transition-colors class', () => {
      render(<Sidebar />);
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('transition-colors');
    });
  });

  describe('user profile section styling', () => {
    it('should be positioned at the bottom', () => {
      render(<Sidebar />);
      const profileSection = screen.getByText('Your Name').closest('div')?.parentElement?.parentElement;
      expect(profileSection).toHaveClass('absolute', 'bottom-4');
    });

    it('should have hover effect', () => {
      render(<Sidebar />);
      const profileButton = screen.getByLabelText('User settings menu');
      expect(profileButton).toHaveClass('hover:bg-gray-100');
    });

    it('should have rounded-full class', () => {
      render(<Sidebar />);
      const profileButton = screen.getByLabelText('User settings menu');
      expect(profileButton).toHaveClass('rounded-full');
    });

    it('should have cursor-pointer class', () => {
      render(<Sidebar />);
      const profileButton = screen.getByLabelText('User settings menu');
      expect(profileButton).toHaveClass('cursor-pointer');
    });
  });

  describe('accessibility', () => {
    it('should have proper component name data attributes', () => {
      render(<Sidebar />);
      const elements = screen.getAllByText('Your Name');
      expect(elements[0]).toHaveAttribute('data-component-name', 'Sidebar');
    });

    it('should stop propagation when user profile is clicked', () => {
      render(<Sidebar />);
      
      const userProfile = screen.getByLabelText('User settings menu');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      
      fireEvent(userProfile, clickEvent);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('logo section', () => {
    it('should render logo SVG', () => {
      render(<Sidebar />);
      const logoSection = screen.getByText('SurfSocial').previousElementSibling;
      expect(logoSection?.tagName).toBe('svg');
    });

    it('should have proper spacing for logo section', () => {
      render(<Sidebar />);
      const logoContainer = screen.getByText('SurfSocial').closest('div')?.parentElement;
      expect(logoContainer).toHaveClass('mb-8');
    });
  });
});
