import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar Component', () => {
  test('renders with default size', () => {
    render(<Avatar name="John Doe" />);
    const avatarElement = screen.getByLabelText('John Doe avatar');
    expect(avatarElement).toBeInTheDocument();
    expect(avatarElement).toHaveClass('w-12 h-12'); // Default size is 'md'
  });

  test('renders with small size', () => {
    render(<Avatar name="John Doe" size="sm" />);
    const avatarElement = screen.getByLabelText('John Doe avatar');
    expect(avatarElement).toHaveClass('w-8 h-8');
  });

  test('renders with large size', () => {
    render(<Avatar name="John Doe" size="lg" />);
    const avatarElement = screen.getByLabelText('John Doe avatar');
    expect(avatarElement).toHaveClass('w-16 h-16');
  });

  test('renders with additional class name', () => {
    render(<Avatar name="John Doe" className="custom-class" />);
    const avatarElement = screen.getByLabelText('John Doe avatar');
    expect(avatarElement).toHaveClass('custom-class');
  });

  test('displays correct initials for single name', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  test('displays correct initials for full name', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('displays question mark for empty name', () => {
    render(<Avatar name="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  test('generates consistent color for the same name', () => {
    const { rerender } = render(<Avatar name="John Doe" />);
    const firstRender = screen.getByLabelText('John Doe avatar');
    const firstClass = Array.from(firstRender.classList).find(cls => cls.startsWith('bg-'));
    
    rerender(<Avatar name="John Doe" />);
    const secondRender = screen.getByLabelText('John Doe avatar');
    const secondClass = Array.from(secondRender.classList).find(cls => cls.startsWith('bg-'));
    
    expect(firstClass).toBe(secondClass);
  });
});
