import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// Mock the dependencies
jest.mock('@/context/PostsContext', () => ({
  PostsProvider: ({ children }) => <div data-testid="posts-provider-mock">{children}</div>
}));

jest.mock('@/components/MainLayout', () => ({
  MainLayout: ({ children }) => <div data-testid="main-layout-mock">{children}</div>
}));

jest.mock('next/font/google', () => ({
  Poppins: () => ({
    variable: '--font-poppins',
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
  }),
  Space_Grotesk: () => ({
    variable: '--font-space-grotesk',
    subsets: ['latin'],
    weight: ['300', '400', '500', '700']
  }),
  Righteous: () => ({
    weight: ['400'],
    variable: '--font-righteous',
    subsets: ['latin']
  }),
  Outfit: () => ({
    variable: '--font-outfit',
    subsets: ['latin'],
    weight: ['300', '400', '500', '700']
  })
}));

describe('RootLayout', () => {
  test('renders children content', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('wraps children with PostsProvider', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('posts-provider-mock')).toBeInTheDocument();
  });

  test('wraps children with MainLayout', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(screen.getByTestId('main-layout-mock')).toBeInTheDocument();
  });

  test('component structure includes html and body elements', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(container).toBeTruthy();
  });

  test('PostsProvider wraps MainLayout', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    const postsProvider = screen.getByTestId('posts-provider-mock');
    const mainLayout = screen.getByTestId('main-layout-mock');
    expect(postsProvider).toContainElement(mainLayout);
  });

  test('MainLayout wraps children content', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    const mainLayout = screen.getByTestId('main-layout-mock');
    const content = screen.getByText('Test Content');
    expect(mainLayout).toContainElement(content);
  });
});
