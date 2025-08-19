import { render, screen, fireEvent, act } from '@testing-library/react';
import { PostsProvider, usePosts } from '../PostsContext';

// Test component to access context values
const TestComponent = () => {
  const { posts, addPost, likePost, retweetPost } = usePosts();
  
  return (
    <div>
      <div data-testid="post-count">{posts.length}</div>
      <button 
        data-testid="add-post" 
        onClick={() => addPost({ 
          author: { name: 'Test User', username: 'testuser' }, 
          content: 'Test post content' 
        })}
      >
        Add Post
      </button>
      <button 
        data-testid="like-post" 
        onClick={() => likePost(posts[0].id)}
      >
        Like Post
      </button>
      <button 
        data-testid="retweet-post" 
        onClick={() => retweetPost(posts[0].id)}
      >
        Retweet Post
      </button>
      {posts.map(post => (
        <div key={post.id} data-testid={`post-${post.id}`}>
          <span data-testid={`likes-${post.id}`}>{post.likes}</span>
          <span data-testid={`retweets-${post.id}`}>{post.retweets}</span>
        </div>
      ))}
    </div>
  );
};

describe('PostsContext', () => {
  test('provides initial posts data', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    // Initial state has 20 posts
    expect(screen.getByTestId('post-count').textContent).toBe('20');
  });
  
  test('adds a new post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    const initialCount = parseInt(screen.getByTestId('post-count').textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('add-post'));
    });
    
    // Count should increase by 1
    expect(screen.getByTestId('post-count').textContent).toBe((initialCount + 1).toString());
  });
  
  test('likes a post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    // Get the first post's initial like count
    const firstPostId = 1;
    const initialLikes = parseInt(screen.getByTestId(`likes-${firstPostId}`).textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('like-post'));
    });
    
    // Like count should increase by 1
    expect(screen.getByTestId(`likes-${firstPostId}`).textContent).toBe((initialLikes + 1).toString());
  });
  
  test('retweets a post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    // Get the first post's initial retweet count
    const firstPostId = 1;
    const initialRetweets = parseInt(screen.getByTestId(`retweets-${firstPostId}`).textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('retweet-post'));
    });
    
    // Retweet count should increase by 1
    expect(screen.getByTestId(`retweets-${firstPostId}`).textContent).toBe((initialRetweets + 1).toString());
  });
  
  test('throws error when usePosts is used outside provider', () => {
    // Silence the error output for this test
    const consoleError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('usePosts must be used within a PostsProvider');
    
    // Restore console.error
    console.error = consoleError;
  });

  test('handles liking non-existent post gracefully', () => {
    const TestComponentForNonExistent = () => {
      const { likePost } = usePosts();
      
      return (
        <div>
          <div data-testid="post-count">{usePosts().posts.length}</div>
          <button 
            data-testid="like-nonexistent" 
            onClick={() => likePost(99999)}
          >
            Like Non-existent Post
          </button>
        </div>
      );
    };

    render(
      <PostsProvider>
        <TestComponentForNonExistent />
      </PostsProvider>
    );
    
    expect(() => {
      act(() => {
        fireEvent.click(screen.getByTestId('like-nonexistent'));
      });
    }).not.toThrow();
    
    expect(screen.getByTestId('post-count').textContent).toBe('20');
  });

  test('handles retweeting non-existent post gracefully', () => {
    const TestComponentForNonExistent = () => {
      const { retweetPost } = usePosts();
      
      return (
        <div>
          <div data-testid="post-count">{usePosts().posts.length}</div>
          <button 
            data-testid="retweet-nonexistent" 
            onClick={() => retweetPost(99999)}
          >
            Retweet Non-existent Post
          </button>
        </div>
      );
    };

    render(
      <PostsProvider>
        <TestComponentForNonExistent />
      </PostsProvider>
    );
    
    expect(() => {
      act(() => {
        fireEvent.click(screen.getByTestId('retweet-nonexistent'));
      });
    }).not.toThrow();
    
    expect(screen.getByTestId('post-count').textContent).toBe('20');
  });

  test('allows multiple likes on the same post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    const firstPostId = 1;
    const initialLikes = parseInt(screen.getByTestId(`likes-${firstPostId}`).textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('like-post'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('like-post'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('like-post'));
    });
    
    // Like count should increase by 3
    expect(screen.getByTestId(`likes-${firstPostId}`).textContent).toBe((initialLikes + 3).toString());
  });

  test('allows multiple retweets on the same post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    const firstPostId = 1;
    const initialRetweets = parseInt(screen.getByTestId(`retweets-${firstPostId}`).textContent);
    
    // Retweet the post multiple times
    act(() => {
      fireEvent.click(screen.getByTestId('retweet-post'));
    });
    act(() => {
      fireEvent.click(screen.getByTestId('retweet-post'));
    });
    
    // Retweet count should increase by 2
    expect(screen.getByTestId(`retweets-${firstPostId}`).textContent).toBe((initialRetweets + 2).toString());
  });

  test('adds post with correct initial values', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    const initialCount = parseInt(screen.getByTestId('post-count').textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('add-post'));
    });
    
    expect(screen.getByTestId('post-count').textContent).toBe((initialCount + 1).toString());
    
    const posts = screen.getAllByTestId(/^post-\d+$/);
    const newPost = posts[0];
    const newPostId = newPost.getAttribute('data-testid').split('-')[1];
    
    expect(screen.getByTestId(`likes-${newPostId}`).textContent).toBe('0');
    expect(screen.getByTestId(`retweets-${newPostId}`).textContent).toBe('0');
  });

  test('maintains post order after adding new post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    const initialFirstPostId = screen.getAllByTestId(/^post-\d+$/)[0].getAttribute('data-testid').split('-')[1];
    
    act(() => {
      fireEvent.click(screen.getByTestId('add-post'));
    });
    
    const postsAfterAdd = screen.getAllByTestId(/^post-\d+$/);
    const newFirstPostId = postsAfterAdd[0].getAttribute('data-testid').split('-')[1];
    const secondPostId = postsAfterAdd[1].getAttribute('data-testid').split('-')[1];
    
    expect(newFirstPostId).not.toBe(initialFirstPostId);
    expect(secondPostId).toBe(initialFirstPostId);
  });

  test('can like and retweet the same post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    const firstPostId = 1;
    const initialLikes = parseInt(screen.getByTestId(`likes-${firstPostId}`).textContent);
    const initialRetweets = parseInt(screen.getByTestId(`retweets-${firstPostId}`).textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('like-post'));
      fireEvent.click(screen.getByTestId('retweet-post'));
    });
    
    expect(screen.getByTestId(`likes-${firstPostId}`).textContent).toBe((initialLikes + 1).toString());
    expect(screen.getByTestId(`retweets-${firstPostId}`).textContent).toBe((initialRetweets + 1).toString());
  });

  test('preserves existing posts when adding new post', () => {
    render(
      <PostsProvider>
        <TestComponent />
      </PostsProvider>
    );
    
    const existingPostId = 2;
    const existingLikes = parseInt(screen.getByTestId(`likes-${existingPostId}`).textContent);
    const existingRetweets = parseInt(screen.getByTestId(`retweets-${existingPostId}`).textContent);
    
    act(() => {
      fireEvent.click(screen.getByTestId('add-post'));
    });
    
    expect(screen.getByTestId(`likes-${existingPostId}`).textContent).toBe(existingLikes.toString());
    expect(screen.getByTestId(`retweets-${existingPostId}`).textContent).toBe(existingRetweets.toString());
  });
});
