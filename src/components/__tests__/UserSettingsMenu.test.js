import { render, screen, fireEvent } from '@testing-library/react';
import { UserSettingsMenu } from '../UserSettingsMenu';

describe('UserSettingsMenu Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <UserSettingsMenu isOpen={false} onClose={mockOnClose} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders menu when isOpen is true', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('renders all menu items', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  test('calls onClose when backdrop is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when menu itself is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menu = screen.getByRole('menu');
    fireEvent.click(menu);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('calls console.log when Profile Settings is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const profileButton = screen.getByText('Profile Settings').closest('button');
    fireEvent.click(profileButton);
    
    expect(console.log).toHaveBeenCalledWith('Profile settings clicked');
  });

  test('calls console.log when Account is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const accountButton = screen.getByText('Account').closest('button');
    fireEvent.click(accountButton);
    
    expect(console.log).toHaveBeenCalledWith('Account clicked');
  });

  test('calls console.log when Privacy is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const privacyButton = screen.getByText('Privacy').closest('button');
    fireEvent.click(privacyButton);
    
    expect(console.log).toHaveBeenCalledWith('Privacy clicked');
  });

  test('calls console.log when Appearance is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const appearanceButton = screen.getByText('Appearance').closest('button');
    fireEvent.click(appearanceButton);
    
    expect(console.log).toHaveBeenCalledWith('Appearance clicked');
  });

  test('calls console.log when Help Center is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const helpButton = screen.getByText('Help Center').closest('button');
    fireEvent.click(helpButton);
    
    expect(console.log).toHaveBeenCalledWith('Help Center clicked');
  });

  test('calls console.log when Log Out is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByText('Log Out').closest('button');
    fireEvent.click(logoutButton);
    
    expect(console.log).toHaveBeenCalledWith('Log Out clicked');
  });

  test('applies special styling to Log Out button', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByText('Log Out').closest('button');
    expect(logoutButton).toHaveClass('text-red-600');
    expect(logoutButton).toHaveClass('hover:bg-red-50');
  });

  test('renders menu with correct ARIA attributes', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    expect(menu).toHaveAttribute('aria-labelledby', 'user-menu-button');
  });

  test('all menu items have menuitem role', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(6);
  });
});
