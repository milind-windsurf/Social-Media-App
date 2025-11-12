import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComposePost } from './ComposePost';
import { PostsProvider } from '@/context/PostsContext';

jest.mock('./Avatar', () => ({
  Avatar: ({ name, size }) => (
    <div data-testid="avatar" data-name={name} data-size={size}>
      Avatar
    </div>
  ),
}));

describe('ComposePost', () => {
  const renderWithProvider = (component) => {
    return render(<PostsProvider>{component}</PostsProvider>);
  };

  describe('rendering', () => {
    it('should render the compose post form', () => {
      renderWithProvider(<ComposePost />);
      expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
    });

    it('should render avatar', () => {
      renderWithProvider(<ComposePost />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-name', 'You');
      expect(avatar).toHaveAttribute('data-size', 'md');
    });

    it('should render Post button', () => {
      renderWithProvider(<ComposePost />);
      expect(screen.getByRole('button', { name: /Post/i })).toBeInTheDocument();
    });

    it('should render character counter', () => {
      renderWithProvider(<ComposePost />);
      expect(screen.getByText('280')).toBeInTheDocument();
    });

    it('should render image upload button', () => {
      renderWithProvider(<ComposePost />);
      const buttons = screen.getAllByRole('button');
      const imageButton = buttons.find(btn => btn.querySelector('svg'));
      expect(imageButton).toBeInTheDocument();
    });

    it('should render emoji button', () => {
      renderWithProvider(<ComposePost />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2);
    });
  });

  describe('textarea behavior', () => {
    it('should allow typing in textarea', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'Test post content' } });
      
      expect(textarea.value).toBe('Test post content');
    });

    it('should update character counter when typing', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      
      expect(screen.getByText('275')).toBeInTheDocument();
    });

    it('should have correct maxLength', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      expect(textarea).toHaveAttribute('maxLength', '280');
    });

    it('should have 3 rows', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      expect(textarea).toHaveAttribute('rows', '3');
    });
  });

  describe('character counter', () => {
    it('should show remaining characters', () => {
      renderWithProvider(<ComposePost />);
      expect(screen.getByText('280')).toBeInTheDocument();
    });

    it('should decrease when typing', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'Test' } });
      
      expect(screen.getByText('276')).toBeInTheDocument();
    });

    it('should turn red when less than 20 characters remaining', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      const longText = 'a'.repeat(265);
      fireEvent.change(textarea, { target: { value: longText } });
      
      const counter = screen.getByText('15');
      expect(counter).toHaveClass('text-red-500');
    });

    it('should be gray when more than 20 characters remaining', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'Short text' } });
      
      const counter = screen.getByText('270');
      expect(counter).toHaveClass('text-gray-500');
    });

    it('should show 0 when at character limit', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      const maxText = 'a'.repeat(280);
      fireEvent.change(textarea, { target: { value: maxText } });
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Post button behavior', () => {
    it('should be disabled when textarea is empty', () => {
      renderWithProvider(<ComposePost />);
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      expect(postButton).toBeDisabled();
    });

    it('should be enabled when textarea has content', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      fireEvent.change(textarea, { target: { value: 'Test post' } });
      
      expect(postButton).not.toBeDisabled();
    });

    it('should be disabled when textarea has only whitespace', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      fireEvent.change(textarea, { target: { value: '   ' } });
      
      expect(postButton).toBeDisabled();
    });

    it('should be disabled when character limit is exceeded', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      const tooLongText = 'a'.repeat(281);
      fireEvent.change(textarea, { target: { value: tooLongText } });
      
      expect(postButton).toBeDisabled();
    });

    it('should have disabled styling when disabled', () => {
      renderWithProvider(<ComposePost />);
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      expect(postButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('form submission', () => {
    it('should add post when form is submitted', async () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      fireEvent.change(textarea, { target: { value: 'New test post' } });
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should clear textarea after posting', async () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      fireEvent.change(textarea, { target: { value: 'Test content' } });
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should reset character counter after posting', async () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      fireEvent.change(textarea, { target: { value: 'Test content' } });
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(screen.getByText('280')).toBeInTheDocument();
      });
    });

    it('should trim whitespace from post content', async () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      fireEvent.change(textarea, { target: { value: '  Test content  ' } });
      fireEvent.click(postButton);
      
      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should prevent default form submission', () => {
      renderWithProvider(<ComposePost />);
      const form = screen.getByPlaceholderText("What's happening?").closest('form');
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'Test' } });
      
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
      
      fireEvent(form, submitEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have border at bottom', () => {
      const { container } = renderWithProvider(<ComposePost />);
      const composeContainer = container.firstChild;
      
      expect(composeContainer).toHaveClass('border-b', 'border-gray-200');
    });

    it('should have proper padding', () => {
      const { container } = renderWithProvider(<ComposePost />);
      const composeContainer = container.firstChild;
      
      expect(composeContainer).toHaveClass('px-6', 'py-4');
    });

    it('should have full width', () => {
      const { container } = renderWithProvider(<ComposePost />);
      const composeContainer = container.firstChild;
      
      expect(composeContainer).toHaveClass('w-full');
    });

    it('should have proper textarea styling', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      expect(textarea).toHaveClass('w-full', 'text-lg', 'border-none', 'resize-none');
    });

    it('should have proper Post button styling', () => {
      renderWithProvider(<ComposePost />);
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      expect(postButton).toHaveClass('bg-blue-500', 'text-white', 'rounded-full', 'font-medium');
    });

    it('should have hover effect on Post button', () => {
      renderWithProvider(<ComposePost />);
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      expect(postButton).toHaveClass('hover:bg-blue-600');
    });

    it('should have transition on Post button', () => {
      renderWithProvider(<ComposePost />);
      const postButton = screen.getByRole('button', { name: /Post/i });
      
      expect(postButton).toHaveClass('transition-colors');
    });
  });

  describe('action buttons', () => {
    it('should have blue color for action buttons', () => {
      renderWithProvider(<ComposePost />);
      const buttons = screen.getAllByRole('button');
      const actionButtons = buttons.filter(btn => btn.querySelector('svg') && btn !== screen.getByRole('button', { name: /Post/i }));
      
      actionButtons.forEach(button => {
        expect(button).toHaveClass('text-blue-500');
      });
    });

    it('should have hover effect on action buttons', () => {
      renderWithProvider(<ComposePost />);
      const buttons = screen.getAllByRole('button');
      const actionButtons = buttons.filter(btn => btn.querySelector('svg') && btn !== screen.getByRole('button', { name: /Post/i }));
      
      actionButtons.forEach(button => {
        expect(button).toHaveClass('hover:bg-blue-50');
      });
    });

    it('should have rounded-full class on action buttons', () => {
      renderWithProvider(<ComposePost />);
      const buttons = screen.getAllByRole('button');
      const actionButtons = buttons.filter(btn => btn.querySelector('svg') && btn !== screen.getByRole('button', { name: /Post/i }));
      
      actionButtons.forEach(button => {
        expect(button).toHaveClass('rounded-full');
      });
    });

    it('should have transition on action buttons', () => {
      renderWithProvider(<ComposePost />);
      const buttons = screen.getAllByRole('button');
      const actionButtons = buttons.filter(btn => btn.querySelector('svg') && btn !== screen.getByRole('button', { name: /Post/i }));
      
      actionButtons.forEach(button => {
        expect(button).toHaveClass('transition-colors');
      });
    });
  });

  describe('layout', () => {
    it('should have flex layout', () => {
      renderWithProvider(<ComposePost />);
      const form = screen.getByPlaceholderText("What's happening?").closest('form');
      const flexContainer = form.querySelector('.flex.space-x-3');
      
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have actions bar at bottom', () => {
      renderWithProvider(<ComposePost />);
      const actionsBar = screen.getByRole('button', { name: /Post/i }).closest('.flex.items-center.justify-between');
      
      expect(actionsBar).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid typing', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'a' } });
      fireEvent.change(textarea, { target: { value: 'ab' } });
      fireEvent.change(textarea, { target: { value: 'abc' } });
      
      expect(textarea.value).toBe('abc');
      expect(screen.getByText('277')).toBeInTheDocument();
    });

    it('should handle newlines in content', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });
      
      expect(textarea.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle special characters', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: '!@#$%^&*()_+-={}[]|:";\'<>?,./' } });
      
      expect(textarea.value).toBe('!@#$%^&*()_+-={}[]|:";\'<>?,./');
    });

    it('should handle emoji in content', () => {
      renderWithProvider(<ComposePost />);
      const textarea = screen.getByPlaceholderText("What's happening?");
      
      fireEvent.change(textarea, { target: { value: 'Hello 👋 World 🌍' } });
      
      expect(textarea.value).toBe('Hello 👋 World 🌍');
    });
  });
});
