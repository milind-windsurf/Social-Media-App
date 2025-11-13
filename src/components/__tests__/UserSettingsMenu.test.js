import { render, screen, fireEvent } from '@testing-library/react';
import { UserSettingsMenu } from '../UserSettingsMenu';

describe('UserSettingsMenu Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when isOpen is false', () => {
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

  test('renders all menu item icons', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(6);
    
    menuItems.forEach(item => {
      expect(item.querySelector('svg')).toBeInTheDocument();
    });
  });

  test('calls onClose when backdrop is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when menu is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menu = screen.getByRole('menu');
    fireEvent.click(menu);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('logs correct message when Profile Settings is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const profileSettingsButton = screen.getByText('Profile Settings');
    fireEvent.click(profileSettingsButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Profile settings clicked');
    consoleSpy.mockRestore();
  });

  test('logs correct message when Account is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const accountButton = screen.getByText('Account');
    fireEvent.click(accountButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Account clicked');
    consoleSpy.mockRestore();
  });

  test('logs correct message when Privacy is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const privacyButton = screen.getByText('Privacy');
    fireEvent.click(privacyButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Privacy clicked');
    consoleSpy.mockRestore();
  });

  test('logs correct message when Appearance is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const appearanceButton = screen.getByText('Appearance');
    fireEvent.click(appearanceButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Appearance clicked');
    consoleSpy.mockRestore();
  });

  test('logs correct message when Help Center is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const helpCenterButton = screen.getByText('Help Center');
    fireEvent.click(helpCenterButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Help Center clicked');
    consoleSpy.mockRestore();
  });

  test('logs correct message when Log Out is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const logOutButton = screen.getByText('Log Out');
    fireEvent.click(logOutButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Log Out clicked');
    consoleSpy.mockRestore();
  });

  test('applies red styling to Log Out button', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const logOutButton = screen.getByText('Log Out').closest('button');
    expect(logOutButton).toHaveClass('text-red-600');
    expect(logOutButton).toHaveClass('hover:bg-red-50');
  });

  test('menu has correct positioning classes', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('fixed');
    expect(menu).toHaveClass('bottom-20');
    expect(menu).toHaveClass('left-4');
    expect(menu).toHaveClass('z-50');
  });

  test('backdrop has correct z-index', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass('z-40');
  });
});
