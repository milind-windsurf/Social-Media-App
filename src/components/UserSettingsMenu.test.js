import { render, screen, fireEvent } from '@testing-library/react';
import { UserSettingsMenu } from './UserSettingsMenu';

describe('UserSettingsMenu', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<UserSettingsMenu isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should render all menu items', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });

    it('should render backdrop', () => {
      const { container } = render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render menu popup', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('fixed', 'bottom-20', 'left-4');
    });
  });

  describe('menu item interactions', () => {
    it('should call console.log when Profile Settings is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      
      const profileSettings = screen.getByText('Profile Settings');
      fireEvent.click(profileSettings);
      
      expect(consoleSpy).toHaveBeenCalledWith('Profile settings clicked');
      consoleSpy.mockRestore();
    });

    it('should call console.log when Account is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      
      const account = screen.getByText('Account');
      fireEvent.click(account);
      
      expect(consoleSpy).toHaveBeenCalledWith('Account clicked');
      consoleSpy.mockRestore();
    });

    it('should call console.log when Privacy is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      
      const privacy = screen.getByText('Privacy');
      fireEvent.click(privacy);
      
      expect(consoleSpy).toHaveBeenCalledWith('Privacy clicked');
      consoleSpy.mockRestore();
    });

    it('should call console.log when Appearance is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      
      const appearance = screen.getByText('Appearance');
      fireEvent.click(appearance);
      
      expect(consoleSpy).toHaveBeenCalledWith('Appearance clicked');
      consoleSpy.mockRestore();
    });

    it('should call console.log when Help Center is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      
      const helpCenter = screen.getByText('Help Center');
      fireEvent.click(helpCenter);
      
      expect(consoleSpy).toHaveBeenCalledWith('Help Center clicked');
      consoleSpy.mockRestore();
    });

    it('should call console.log when Log Out is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      
      const logOut = screen.getByText('Log Out');
      fireEvent.click(logOut);
      
      expect(consoleSpy).toHaveBeenCalledWith('Log Out clicked');
      consoleSpy.mockRestore();
    });
  });

  describe('backdrop interactions', () => {
    it('should call onClose when backdrop is clicked', () => {
      const { container } = render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const backdrop = container.querySelector('.fixed.inset-0');
      
      fireEvent.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when menu is clicked', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      fireEvent.click(menu);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should stop propagation when menu is clicked', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      
      fireEvent(menu, clickEvent);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have correct styling for menu popup', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveClass('bg-white', 'rounded-xl', 'shadow-lg', 'border', 'border-gray-200');
    });

    it('should have correct z-index for backdrop', () => {
      const { container } = render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const backdrop = container.querySelector('.fixed.inset-0');
      
      expect(backdrop).toHaveClass('z-40');
    });

    it('should have correct z-index for menu', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveClass('z-50');
    });

    it('should have hover effect on menu items', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const profileSettings = screen.getByText('Profile Settings').closest('button');
      
      expect(profileSettings).toHaveClass('hover:bg-gray-50');
    });

    it('should have special styling for Log Out item', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const logOut = screen.getByText('Log Out').closest('button');
      
      expect(logOut).toHaveClass('text-red-600', 'hover:bg-red-50');
    });

    it('should have transition-colors on menu items', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const profileSettings = screen.getByText('Profile Settings').closest('button');
      
      expect(profileSettings).toHaveClass('transition-colors');
    });
  });

  describe('accessibility', () => {
    it('should have proper role for menu', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should have aria-orientation attribute', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should have aria-labelledby attribute', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveAttribute('aria-labelledby', 'user-menu-button');
    });

    it('should have menuitem role for each menu item', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menuItems = screen.getAllByRole('menuitem');
      
      expect(menuItems).toHaveLength(6);
    });
  });

  describe('menu items layout', () => {
    it('should have correct width for menu items', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const profileSettings = screen.getByText('Profile Settings').closest('button');
      
      expect(profileSettings).toHaveClass('w-full');
    });

    it('should have flex layout for menu items', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const profileSettings = screen.getByText('Profile Settings').closest('button');
      
      expect(profileSettings).toHaveClass('flex', 'items-center', 'space-x-3');
    });

    it('should have text-left alignment', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const profileSettings = screen.getByText('Profile Settings').closest('button');
      
      expect(profileSettings).toHaveClass('text-left');
    });

    it('should have proper padding', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const profileSettings = screen.getByText('Profile Settings').closest('button');
      
      expect(profileSettings).toHaveClass('px-4', 'py-3');
    });
  });

  describe('icons', () => {
    it('should render icons for all menu items', () => {
      const { container } = render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const svgs = container.querySelectorAll('svg');
      
      expect(svgs.length).toBeGreaterThanOrEqual(6);
    });

    it('should have correct size for icons', () => {
      const { container } = render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const firstSvg = container.querySelector('svg');
      
      expect(firstSvg).toHaveClass('w-5', 'h-5');
    });
  });

  describe('menu positioning', () => {
    it('should be positioned at bottom-20', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveClass('bottom-20');
    });

    it('should be positioned at left-4', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveClass('left-4');
    });

    it('should have fixed positioning', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveClass('fixed');
    });

    it('should have correct width', () => {
      render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
      const menu = screen.getByRole('menu');
      
      expect(menu).toHaveClass('w-56');
    });
  });
});
