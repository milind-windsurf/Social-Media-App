import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

jest.mock('@/context/PostsContext', () => ({
  PostsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posts-provider">{children}</div>
  ),
}));

jest.mock('@/components/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
    subsets: ['latin'],
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
    subsets: ['latin'],
  }),
  Righteous: () => ({
    variable: '--font-righteous',
    subsets: ['latin'],
  }),
  Poppins: () => ({
    variable: '--font-poppins',
    subsets: ['latin'],
  }),
  Space_Grotesk: () => ({
    variable: '--font-space-grotesk',
    subsets: ['latin'],
  }),
  Outfit: () => ({
    variable: '--font-outfit',
    subsets: ['latin'],
  }),
}));

describe('RootLayout', () => {
  it('renders children content', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Child Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('wraps children with PostsProvider', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('posts-provider')).toBeInTheDocument();
  });

  it('wraps children with MainLayout', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });

  it('nests components in correct order: PostsProvider > MainLayout > children', () => {
    render(
      <RootLayout>
        <div data-testid="child">Child</div>
      </RootLayout>
    );
    
    const postsProvider = screen.getByTestId('posts-provider');
    const mainLayout = screen.getByTestId('main-layout');
    const child = screen.getByTestId('child');
    
    expect(postsProvider).toContainElement(mainLayout);
    expect(mainLayout).toContainElement(child);
  });
});
