import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      render(<Avatar name="John Doe" size="lg" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('w-16', 'h-16');
    });

    it('should render with small size', () => {
      render(<Avatar name="John Doe" size="sm" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('w-8', 'h-8');
    });

    it('should render with medium size by default', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('w-12', 'h-12');
    });

    it('should apply custom className', () => {
      render(<Avatar name="John Doe" className="custom-class" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('custom-class');
    });

    it('should have rounded-full class', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('rounded-full');
    });
  });

  describe('initials generation', () => {
    it('should display initials for single name', () => {
      render(<Avatar name="John" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should display initials for full name', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display initials for name with multiple parts', () => {
      render(<Avatar name="John Michael Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle empty name', () => {
      render(<Avatar name="" />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should handle name with extra spaces', () => {
      render(<Avatar name="  John   Doe  " />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should capitalize initials', () => {
      render(<Avatar name="john doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle single character name', () => {
      render(<Avatar name="J" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('color generation', () => {
    it('should generate consistent colors for the same name', () => {
      const { rerender } = render(<Avatar name="John Doe" />);
      const firstAvatar = screen.getByLabelText('John Doe avatar');
      const firstClasses = firstAvatar.className;

      rerender(<Avatar name="John Doe" />);
      const secondAvatar = screen.getByLabelText('John Doe avatar');
      const secondClasses = secondAvatar.className;

      expect(firstClasses).toBe(secondClasses);
    });

    it('should generate different colors for different names', () => {
      const { rerender } = render(<Avatar name="John Doe" />);
      const firstAvatar = screen.getByLabelText('John Doe avatar');
      const firstClasses = firstAvatar.className;

      rerender(<Avatar name="Jane Smith" />);
      const secondAvatar = screen.getByLabelText('Jane Smith avatar');
      const secondClasses = secondAvatar.className;

      expect(firstClasses).not.toBe(secondClasses);
    });

    it('should have a background color class', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      const hasBackgroundColor = /bg-\w+-\d+/.test(avatar.className);
      expect(hasBackgroundColor).toBe(true);
    });

    it('should have a text color class', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      const initialsSpan = avatar.querySelector('span');
      expect(initialsSpan).toBeInTheDocument();
      const hasTextColor = /text-\w+/.test(initialsSpan?.className || '');
      expect(hasTextColor).toBe(true);
    });
  });

  describe('font sizes', () => {
    it('should use small font size for small avatar', () => {
      render(<Avatar name="John Doe" size="sm" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      const initialsSpan = avatar.querySelector('span');
      expect(initialsSpan).toHaveClass('text-xs');
    });

    it('should use base font size for medium avatar', () => {
      render(<Avatar name="John Doe" size="md" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      const initialsSpan = avatar.querySelector('span');
      expect(initialsSpan).toHaveClass('text-base');
    });

    it('should use large font size for large avatar', () => {
      render(<Avatar name="John Doe" size="lg" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      const initialsSpan = avatar.querySelector('span');
      expect(initialsSpan).toHaveClass('text-xl');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label', () => {
      render(<Avatar name="John Doe" />);
      expect(screen.getByLabelText('John Doe avatar')).toBeInTheDocument();
    });

    it('should update aria-label when name changes', () => {
      const { rerender } = render(<Avatar name="John Doe" />);
      expect(screen.getByLabelText('John Doe avatar')).toBeInTheDocument();

      rerender(<Avatar name="Jane Smith" />);
      expect(screen.getByLabelText('Jane Smith avatar')).toBeInTheDocument();
      expect(screen.queryByLabelText('John Doe avatar')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in name', () => {
      render(<Avatar name="John-Paul O'Brien" />);
      const avatar = screen.getByLabelText("John-Paul O'Brien avatar");
      expect(avatar).toBeInTheDocument();
    });

    it('should handle numeric characters in name', () => {
      render(<Avatar name="User123" />);
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      render(<Avatar name="José García" />);
      expect(screen.getByText('JG')).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      const longName = 'John Michael Christopher Alexander Benjamin';
      render(<Avatar name={longName} />);
      expect(screen.getByText('JB')).toBeInTheDocument();
    });
  });

  describe('layout and styling', () => {
    it('should have flex display', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('flex');
    });

    it('should center items', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('items-center', 'justify-center');
    });

    it('should have font-medium class', () => {
      render(<Avatar name="John Doe" />);
      const avatar = screen.getByLabelText('John Doe avatar');
      expect(avatar).toHaveClass('font-medium');
    });
  });
});
