import { render, screen } from '@testing-library/react';
import RootLayout, { metadata } from '../layout';

jest.mock('@/context/PostsContext', () => ({
  PostsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posts-provider-mock">{children}</div>
  )
}));

jest.mock('@/components/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout-mock">{children}</div>
  )
}));

describe('RootLayout Component', () => {
  test('renders children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  test('wraps children with PostsProvider', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    
    expect(screen.getByTestId('posts-provider-mock')).toBeInTheDocument();
  });

  test('wraps children with MainLayout', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    
    expect(screen.getByTestId('main-layout-mock')).toBeInTheDocument();
  });

  test('renders with proper structure', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="content">Content</div>
      </RootLayout>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  test('metadata has correct title', () => {
    expect(metadata.title).toBe('Social Media App');
  });

  test('metadata has correct description', () => {
    expect(metadata.description).toBe('A Twitter-like social media timeline app built with Next.js');
  });

  test('nests components in correct order: PostsProvider > MainLayout > children', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Content</div>
      </RootLayout>
    );
    
    const postsProvider = screen.getByTestId('posts-provider-mock');
    const mainLayout = screen.getByTestId('main-layout-mock');
    const child = screen.getByTestId('test-child');
    
    expect(postsProvider).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(child);
  });
});
