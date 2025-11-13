import { render, screen } from '@testing-library/react';
import { MainLayout } from '../MainLayout';

jest.mock('../Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar-mock" />
}));

describe('MainLayout Component', () => {
  test('renders children content', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders the Sidebar component', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });

  test('applies correct layout classes', () => {
    const { container } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    const layoutDiv = container.querySelector('.min-h-screen.bg-gray-50');
    expect(layoutDiv).toBeInTheDocument();
  });

  test('applies correct main content area classes', () => {
    const { container } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    const mainContentArea = container.querySelector('.ml-64');
    expect(mainContentArea).toBeInTheDocument();
  });

  test('applies max-width constraint to content', () => {
    const { container } = render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    const maxWidthDiv = container.querySelector('.max-w-2xl.mx-auto');
    expect(maxWidthDiv).toBeInTheDocument();
  });

  test('renders multiple children correctly', () => {
    render(
      <MainLayout>
        <div>First Child</div>
        <div>Second Child</div>
      </MainLayout>
    );
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });
});
