import { render, screen, fireEvent } from '@testing-library/react';
import { ComposePost } from '../ComposePost';
import { usePosts } from '@/context/PostsContext';

// Mock the dependencies
jest.mock('@/context/PostsContext');
jest.mock('../Avatar', () => ({
  Avatar: () => <div data-testid="avatar-mock" />
}));

describe('ComposePost Component', () => {
  // Mock context functions
  const mockAddPost = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementation
    usePosts.mockReturnValue({
      addPost: mockAddPost
    });
  });

  test('renders the compose area', () => {
    render(<ComposePost />);
    
    // Check if the textarea is rendered
    expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
    
    // Check if the Post button is rendered
    expect(screen.getByText('Post')).toBeInTheDocument();
    
    // Check if the avatar is rendered
    expect(screen.getByTestId('avatar-mock')).toBeInTheDocument();
  });

  test('updates content when typing in textarea', () => {
    render(<ComposePost />);
    
    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: 'Hello world!' } });
    
    // Check if the textarea value is updated
    expect(textarea.value).toBe('Hello world!');
  });

  test('shows correct character count', () => {
    render(<ComposePost />);
    
    const textarea = screen.getByPlaceholderText("What's happening?");
    const initialCount = 280; // Character limit
    
    // Initial state should show 280 characters remaining
    expect(screen.getByText('280')).toBeInTheDocument();
    
    // Type some text
    fireEvent.change(textarea, { target: { value: 'Hello world!' } });
    
    // Should show remaining characters (280 - 12)
    expect(screen.getByText(`${initialCount - 12}`)).toBeInTheDocument();
  });

  test('disables Post button when textarea is empty', () => {
    render(<ComposePost />);
    
    const postButton = screen.getByText('Post');
    
    // Button should be disabled initially
    expect(postButton).toBeDisabled();
    
    // Type some text
    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: 'Hello world!' } });
    
    // Button should be enabled
    expect(postButton).not.toBeDisabled();
    
    // Clear the textarea
    fireEvent.change(textarea, { target: { value: '' } });
    
    // Button should be disabled again
    expect(postButton).toBeDisabled();
  });

  test('changes text color when approaching character limit', () => {
    render(<ComposePost />);
    
    const textarea = screen.getByPlaceholderText("What's happening?");
    
    // Type a long text that leaves less than 20 characters
    const longText = 'A'.repeat(265);
    fireEvent.change(textarea, { target: { value: longText } });
    
    // Get the character count element
    const charCount = screen.getByText('15');
    
    // Should have red text class
    expect(charCount).toHaveClass('text-red-500');
  });

  test('submits form and calls addPost when Post button is clicked', () => {
    render(<ComposePost />);
    
    // Type some text
    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: 'Test post content' } });
    
    // Click the Post button
    const postButton = screen.getByText('Post');
    fireEvent.click(postButton);
    
    // Check if addPost was called with correct data
    expect(mockAddPost).toHaveBeenCalledWith({
      author: {
        name: 'You',
        username: 'you'
      },
      content: 'Test post content'
    });
    
    // Textarea should be cleared after posting
    expect(textarea.value).toBe('');
  });

  test('trims whitespace from content when posting', () => {
    render(<ComposePost />);
    
    // Type text with whitespace
    const textarea = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(textarea, { target: { value: '  Trimmed content  ' } });
    
    // Submit the form
    const form = textarea.closest('form');
    fireEvent.submit(form);
    
    // Check if addPost was called with trimmed content
    expect(mockAddPost).toHaveBeenCalledWith({
      author: {
        name: 'You',
        username: 'you'
      },
      content: 'Trimmed content'
    });
  });
});
