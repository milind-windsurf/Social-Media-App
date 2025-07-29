import { render, screen, fireEvent, act } from '@testing-library/react';
import { PostsProvider, usePosts } from '../PostsContext';

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
});
