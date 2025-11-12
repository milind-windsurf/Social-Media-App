import { render, screen } from '@testing-library/react';
import { MainLayout } from './MainLayout';

jest.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('MainLayout', () => {
  describe('rendering', () => {
    it('should render children', () => {
      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render sidebar', () => {
      render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <MainLayout>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </MainLayout>
      );
      
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('should render with empty children', () => {
      render(<MainLayout>{null}</MainLayout>);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render with string children', () => {
      render(<MainLayout>Simple text content</MainLayout>);
      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('should have correct root container styling', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    it('should have main content area with left margin', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const mainContent = screen.getByText('Test Content').closest('div')?.parentElement?.parentElement;
      expect(mainContent).toHaveClass('ml-64');
    });

    it('should have max-width container for content', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const contentContainer = screen.getByText('Test Content').closest('div')?.parentElement;
      expect(contentContainer).toHaveClass('max-w-2xl', 'mx-auto');
    });
  });

  describe('sidebar integration', () => {
    it('should render sidebar before main content', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const sidebar = screen.getByTestId('sidebar');
      const content = screen.getByText('Test Content');
      
      const sidebarPosition = Array.from(container.querySelectorAll('*')).indexOf(sidebar.parentElement!);
      const contentPosition = Array.from(container.querySelectorAll('*')).indexOf(content.parentElement!);
      
      expect(sidebarPosition).toBeLessThan(contentPosition);
    });
  });

  describe('responsive behavior', () => {
    it('should maintain layout structure with different content sizes', () => {
      const { rerender } = render(
        <MainLayout>
          <div>Small content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Small content')).toBeInTheDocument();
      
      rerender(
        <MainLayout>
          <div>
            <p>Large content</p>
            <p>With multiple paragraphs</p>
            <p>And more text</p>
          </div>
        </MainLayout>
      );
      
      expect(screen.getByText('Large content')).toBeInTheDocument();
      expect(screen.getByText('With multiple paragraphs')).toBeInTheDocument();
      expect(screen.getByText('And more text')).toBeInTheDocument();
    });
  });

  describe('content area styling', () => {
    it('should center content horizontally', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const contentContainer = screen.getByText('Test Content').closest('div')?.parentElement;
      expect(contentContainer).toHaveClass('mx-auto');
    });

    it('should have max-width constraint', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const contentContainer = screen.getByText('Test Content').closest('div')?.parentElement;
      expect(contentContainer).toHaveClass('max-w-2xl');
    });
  });

  describe('TypeScript types', () => {
    it('should accept ReactNode as children', () => {
      render(
        <MainLayout>
          <div>
            <span>Nested</span>
            <strong>Content</strong>
          </div>
        </MainLayout>
      );
      
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept fragments as children', () => {
      render(
        <MainLayout>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </MainLayout>
      );
      
      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
    });
  });

  describe('background styling', () => {
    it('should have gray background', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('bg-gray-50');
    });

    it('should have min-h-screen class', () => {
      const { container } = render(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      const rootDiv = container.firstChild;
      expect(rootDiv).toHaveClass('min-h-screen');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined children', () => {
      render(<MainLayout>{undefined}</MainLayout>);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should handle boolean children', () => {
      render(<MainLayout>{false}</MainLayout>);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should handle array of children', () => {
      const children = [
        <div key="1">Child 1</div>,
        <div key="2">Child 2</div>,
        <div key="3">Child 3</div>,
      ];
      
      render(<MainLayout>{children}</MainLayout>);
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should handle complex nested structures', () => {
      render(
        <MainLayout>
          <div>
            <header>Header</header>
            <main>
              <article>Article Content</article>
            </main>
            <footer>Footer</footer>
          </div>
        </MainLayout>
      );
      
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Article Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
