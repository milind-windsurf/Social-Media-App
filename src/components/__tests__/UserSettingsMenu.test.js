import { render, screen, fireEvent } from '@testing-library/react';
import { UserSettingsMenu } from '../UserSettingsMenu';

describe('UserSettingsMenu', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <UserSettingsMenu isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when isOpen is true', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders all menu items', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when menu is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menu = screen.getByRole('menu');
    fireEvent.click(menu);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls console.log when Profile Settings is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const profileButton = screen.getByText('Profile Settings');
    fireEvent.click(profileButton);
    
    expect(console.log).toHaveBeenCalledWith('Profile settings clicked');
  });

  it('calls console.log when Account is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const accountButton = screen.getByText('Account');
    fireEvent.click(accountButton);
    
    expect(console.log).toHaveBeenCalledWith('Account clicked');
  });

  it('calls console.log when Privacy is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const privacyButton = screen.getByText('Privacy');
    fireEvent.click(privacyButton);
    
    expect(console.log).toHaveBeenCalledWith('Privacy clicked');
  });

  it('calls console.log when Appearance is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const appearanceButton = screen.getByText('Appearance');
    fireEvent.click(appearanceButton);
    
    expect(console.log).toHaveBeenCalledWith('Appearance clicked');
  });

  it('calls console.log when Help Center is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const helpButton = screen.getByText('Help Center');
    fireEvent.click(helpButton);
    
    expect(console.log).toHaveBeenCalledWith('Help Center clicked');
  });

  it('calls console.log when Log Out is clicked', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);
    
    expect(console.log).toHaveBeenCalledWith('Log Out clicked');
  });

  it('applies red styling to Log Out button', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const logoutButton = screen.getByText('Log Out').closest('button');
    expect(logoutButton).toHaveClass('text-red-600');
    expect(logoutButton).toHaveClass('hover:bg-red-50');
  });

  it('renders menu with correct ARIA attributes', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    expect(menu).toHaveAttribute('aria-labelledby', 'user-menu-button');
  });

  it('renders all menu items with menuitem role', () => {
    render(<UserSettingsMenu isOpen={true} onClose={mockOnClose} />);
    
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(6);
  });

  it('renders menu with correct positioning classes', () => {
    const { container } = render(
      <UserSettingsMenu isOpen={true} onClose={mockOnClose} />
    );
    
    const menu = container.querySelector('.fixed.bottom-20.left-4');
    expect(menu).toBeInTheDocument();
  });

  it('renders backdrop with correct z-index', () => {
    const { container } = render(
      <UserSettingsMenu isOpen={true} onClose={mockOnClose} />
    );
    
    const backdrop = container.querySelector('.z-40');
    expect(backdrop).toBeInTheDocument();
  });

  it('renders menu with higher z-index than backdrop', () => {
    const { container } = render(
      <UserSettingsMenu isOpen={true} onClose={mockOnClose} />
    );
    
    const menu = container.querySelector('.z-50');
    expect(menu).toBeInTheDocument();
  });
});
