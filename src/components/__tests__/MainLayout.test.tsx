import { render, screen } from '@testing-library/react';
import { MainLayout } from '../MainLayout';

jest.mock('../Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('MainLayout', () => {
  it('renders without crashing', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the Sidebar component', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders children content in the main area', () => {
    render(
      <MainLayout>
        <div data-testid="child-content">Child Content</div>
      </MainLayout>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('applies correct layout classes', () => {
    const { container } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    const layoutDiv = container.querySelector('.min-h-screen.bg-gray-50');
    expect(layoutDiv).toBeInTheDocument();
  });

  it('applies correct margin to main content area', () => {
    const { container } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    const mainContentDiv = container.querySelector('.ml-64');
    expect(mainContentDiv).toBeInTheDocument();
  });

  it('applies max-width constraint to content', () => {
    const { container } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    const maxWidthDiv = container.querySelector('.max-w-2xl.mx-auto');
    expect(maxWidthDiv).toBeInTheDocument();
  });
});
