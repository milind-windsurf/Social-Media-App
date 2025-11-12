import { render, screen, fireEvent } from '@testing-library/react';
import { Post } from './Post';
import { PostsProvider } from '@/context/PostsContext';

jest.mock('./Avatar', () => ({
  Avatar: ({ name, size }) => (
    <div data-testid="avatar" data-name={name} data-size={size}>
      Avatar
    </div>
  ),
}));

describe('Post', () => {
  const mockPost = {
    id: 1,
    author: {
      name: 'John Doe',
      username: 'johndoe'
    },
    content: 'This is a test post',
    timestamp: new Date('2024-01-15T10:30:00'),
    likes: 42,
    retweets: 12,
    replies: 5
  };

  const renderWithProvider = (component) => {
    return render(<PostsProvider>{component}</PostsProvider>);
  };

  describe('rendering', () => {
    it('should render post content', () => {
      renderWithProvider(<Post post={mockPost} />);
      expect(screen.getByText('This is a test post')).toBeInTheDocument();
    });

    it('should render author name', () => {
      renderWithProvider(<Post post={mockPost} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render author username', () => {
      renderWithProvider(<Post post={mockPost} />);
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
    });

    it('should render avatar', () => {
      renderWithProvider(<Post post={mockPost} />);
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveAttribute('data-name', 'John Doe');
      expect(avatar).toHaveAttribute('data-size', 'md');
    });

    it('should render likes count', () => {
      renderWithProvider(<Post post={mockPost} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render retweets count', () => {
      renderWithProvider(<Post post={mockPost} />);
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('should render replies count', () => {
      renderWithProvider(<Post post={mockPost} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('timestamp formatting', () => {
    it('should format recent timestamp as minutes', () => {
      const recentPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      };
      renderWithProvider(<Post post={recentPost} />);
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    it('should format timestamp as hours', () => {
      const hourPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      };
      renderWithProvider(<Post post={hourPost} />);
      expect(screen.getByText('3h')).toBeInTheDocument();
    });

    it('should format timestamp as days', () => {
      const dayPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      };
      renderWithProvider(<Post post={dayPost} />);
      expect(screen.getByText('2d')).toBeInTheDocument();
    });

    it('should show "now" for very recent posts', () => {
      const nowPost = {
        ...mockPost,
        timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
      };
      renderWithProvider(<Post post={nowPost} />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });
  });

  describe('like button', () => {
    it('should render like button', () => {
      renderWithProvider(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should increment likes when clicked', () => {
      renderWithProvider(<Post post={mockPost} />);
      const likeButton = screen.getAllByRole('button')[2]; // Like button is the 3rd button
      
      fireEvent.click(likeButton);
      
      expect(screen.getByText('43')).toBeInTheDocument();
    });

    it('should increment likes multiple times', () => {
      renderWithProvider(<Post post={mockPost} />);
      const likeButton = screen.getAllByRole('button')[2];
      
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should have hover effect', () => {
      renderWithProvider(<Post post={mockPost} />);
      const likeButton = screen.getAllByRole('button')[2];
      
      expect(likeButton).toHaveClass('hover:text-red-500');
    });

    it('should have transition', () => {
      renderWithProvider(<Post post={mockPost} />);
      const likeButton = screen.getAllByRole('button')[2];
      
      expect(likeButton).toHaveClass('transition-colors');
    });
  });

  describe('retweet button', () => {
    it('should render retweet button', () => {
      renderWithProvider(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    it('should increment retweets when clicked', () => {
      renderWithProvider(<Post post={mockPost} />);
      const retweetButton = screen.getAllByRole('button')[1]; // Retweet button is the 2nd button
      
      fireEvent.click(retweetButton);
      
      expect(screen.getByText('13')).toBeInTheDocument();
    });

    it('should increment retweets multiple times', () => {
      renderWithProvider(<Post post={mockPost} />);
      const retweetButton = screen.getAllByRole('button')[1];
      
      fireEvent.click(retweetButton);
      fireEvent.click(retweetButton);
      
      expect(screen.getByText('14')).toBeInTheDocument();
    });

    it('should have hover effect', () => {
      renderWithProvider(<Post post={mockPost} />);
      const retweetButton = screen.getAllByRole('button')[1];
      
      expect(retweetButton).toHaveClass('hover:text-green-500');
    });

    it('should have transition', () => {
      renderWithProvider(<Post post={mockPost} />);
      const retweetButton = screen.getAllByRole('button')[1];
      
      expect(retweetButton).toHaveClass('transition-colors');
    });
  });

  describe('reply button', () => {
    it('should render reply button', () => {
      renderWithProvider(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toBeInTheDocument();
    });

    it('should have hover effect', () => {
      renderWithProvider(<Post post={mockPost} />);
      const replyButton = screen.getAllByRole('button')[0];
      
      expect(replyButton).toHaveClass('hover:text-blue-500');
    });

    it('should have transition', () => {
      renderWithProvider(<Post post={mockPost} />);
      const replyButton = screen.getAllByRole('button')[0];
      
      expect(replyButton).toHaveClass('transition-colors');
    });
  });

  describe('share button', () => {
    it('should render share button', () => {
      renderWithProvider(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[3]).toBeInTheDocument();
    });

    it('should have hover effect', () => {
      renderWithProvider(<Post post={mockPost} />);
      const shareButton = screen.getAllByRole('button')[3];
      
      expect(shareButton).toHaveClass('hover:text-blue-500');
    });

    it('should have transition', () => {
      renderWithProvider(<Post post={mockPost} />);
      const shareButton = screen.getAllByRole('button')[3];
      
      expect(shareButton).toHaveClass('transition-colors');
    });
  });

  describe('styling', () => {
    it('should have border at bottom', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const postContainer = container.firstChild;
      
      expect(postContainer).toHaveClass('border-b', 'border-gray-200');
    });

    it('should have hover effect', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const postContainer = container.firstChild;
      
      expect(postContainer).toHaveClass('hover:bg-gray-50');
    });

    it('should have transition', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const postContainer = container.firstChild;
      
      expect(postContainer).toHaveClass('transition-colors');
    });

    it('should have proper padding', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const postContainer = container.firstChild;
      
      expect(postContainer).toHaveClass('px-6', 'py-4');
    });

    it('should have full width', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const postContainer = container.firstChild;
      
      expect(postContainer).toHaveClass('w-full');
    });
  });

  describe('author info styling', () => {
    it('should have bold author name', () => {
      renderWithProvider(<Post post={mockPost} />);
      const authorName = screen.getByText('John Doe');
      
      expect(authorName).toHaveClass('font-display', 'font-bold', 'text-gray-900');
    });

    it('should have hover effect on author name', () => {
      renderWithProvider(<Post post={mockPost} />);
      const authorName = screen.getByText('John Doe');
      
      expect(authorName).toHaveClass('hover:underline', 'cursor-pointer');
    });

    it('should have monospace font for username', () => {
      renderWithProvider(<Post post={mockPost} />);
      const username = screen.getByText('@johndoe');
      
      expect(username).toHaveClass('font-mono');
    });

    it('should have gray color for username', () => {
      renderWithProvider(<Post post={mockPost} />);
      const username = screen.getByText('@johndoe');
      
      expect(username).toHaveClass('text-gray-500');
    });
  });

  describe('content styling', () => {
    it('should have proper text styling', () => {
      renderWithProvider(<Post post={mockPost} />);
      const content = screen.getByText('This is a test post');
      
      expect(content).toHaveClass('text-gray-900', 'text-base', 'leading-relaxed', 'text-body');
    });

    it('should have margin top', () => {
      renderWithProvider(<Post post={mockPost} />);
      const content = screen.getByText('This is a test post');
      
      expect(content).toHaveClass('mt-1');
    });
  });

  describe('action buttons styling', () => {
    it('should have gray color by default', () => {
      renderWithProvider(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveClass('text-gray-500');
      });
    });

    it('should have flex layout', () => {
      renderWithProvider(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveClass('flex', 'items-center', 'space-x-2');
      });
    });

    it('should have group class', () => {
      renderWithProvider(<Post post={mockPost} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveClass('group');
      });
    });
  });

  describe('action icons styling', () => {
    it('should have rounded background on hover', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const iconContainers = container.querySelectorAll('.p-2.rounded-full');
      
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should have proper size for icons', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const icons = container.querySelectorAll('svg.w-4.h-4');
      
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('counts styling', () => {
    it('should have text-accent class on counts', () => {
      renderWithProvider(<Post post={mockPost} />);
      const counts = screen.getAllByText(/^\d+$/);
      
      counts.forEach(count => {
        if (count.textContent !== '42' && count.textContent !== '12' && count.textContent !== '5') return;
        expect(count).toHaveClass('text-accent');
      });
    });

    it('should have small text size', () => {
      renderWithProvider(<Post post={mockPost} />);
      const counts = screen.getAllByText(/^\d+$/);
      
      counts.forEach(count => {
        if (count.textContent !== '42' && count.textContent !== '12' && count.textContent !== '5') return;
        expect(count).toHaveClass('text-sm');
      });
    });
  });

  describe('layout', () => {
    it('should have flex layout for main container', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const flexContainer = container.querySelector('.flex.space-x-3');
      
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have action buttons in a row', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const actionsContainer = container.querySelector('.flex.items-center.justify-between');
      
      expect(actionsContainer).toBeInTheDocument();
    });

    it('should have max width for actions', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const actionsContainer = container.querySelector('.max-w-md');
      
      expect(actionsContainer).toBeInTheDocument();
    });

    it('should have margin top for actions', () => {
      const { container } = renderWithProvider(<Post post={mockPost} />);
      const actionsContainer = container.querySelector('.mt-3');
      
      expect(actionsContainer).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle post with zero counts', () => {
      const zeroPost = {
        ...mockPost,
        likes: 0,
        retweets: 0,
        replies: 0
      };
      renderWithProvider(<Post post={zeroPost} />);
      
      const zeroCounts = screen.getAllByText('0');
      expect(zeroCounts.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle post with large counts', () => {
      const largePost = {
        ...mockPost,
        likes: 9999,
        retweets: 8888,
        replies: 7777
      };
      renderWithProvider(<Post post={largePost} />);
      
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('8888')).toBeInTheDocument();
      expect(screen.getByText('7777')).toBeInTheDocument();
    });

    it('should handle long content', () => {
      const longPost = {
        ...mockPost,
        content: 'This is a very long post content that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on and on'
      };
      renderWithProvider(<Post post={longPost} />);
      
      expect(screen.getByText(/This is a very long post content/)).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const specialPost = {
        ...mockPost,
        content: 'Special chars: !@#$%^&*()_+-={}[]|:";\'<>?,./'
      };
      renderWithProvider(<Post post={specialPost} />);
      
      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
    });

    it('should handle emoji in content', () => {
      const emojiPost = {
        ...mockPost,
        content: 'Hello 👋 World 🌍 🚀'
      };
      renderWithProvider(<Post post={emojiPost} />);
      
      expect(screen.getByText('Hello 👋 World 🌍 🚀')).toBeInTheDocument();
    });

    it('should handle special characters in author name', () => {
      const specialAuthorPost = {
        ...mockPost,
        author: {
          name: "John O'Brien-Smith",
          username: 'johnobrien'
        }
      };
      renderWithProvider(<Post post={specialAuthorPost} />);
      
      expect(screen.getByText("John O'Brien-Smith")).toBeInTheDocument();
    });
  });

  describe('console.log in formatTime', () => {
    it('should call console.log when rendering', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      renderWithProvider(<Post post={mockPost} />);
      
      expect(consoleSpy).toHaveBeenCalledWith('hello!');
      
      consoleSpy.mockRestore();
    });
  });
});
