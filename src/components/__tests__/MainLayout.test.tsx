import { render, screen } from '@testing-library/react';
import { MainLayout } from '../MainLayout';

jest.mock('../Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar-mock">Sidebar</div>
}));

describe('MainLayout Component', () => {
  test('renders children correctly', () => {
    render(
      <MainLayout>
        <div data-testid="test-child">Test Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders sidebar component', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });

  test('applies correct layout structure', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const mainContainer = container.querySelector('.min-h-screen.bg-gray-50');
    expect(mainContainer).toBeInTheDocument();
    
    const contentArea = container.querySelector('.ml-64');
    expect(contentArea).toBeInTheDocument();
    
    const maxWidthContainer = container.querySelector('.max-w-2xl.mx-auto');
    expect(maxWidthContainer).toBeInTheDocument();
  });

  test('renders multiple children correctly', () => {
    render(
      <MainLayout>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
