import { render, screen } from '@testing-library/react';
import Home from '../page';

jest.mock('@/components/Timeline', () => ({
  Timeline: () => <div data-testid="timeline-mock">Timeline Component</div>
}));

jest.mock('@/components/ComposePost', () => ({
  ComposePost: () => <div data-testid="compose-post-mock">ComposePost Component</div>
}));

describe('Home Page', () => {
  test('renders the page', () => {
    render(<Home />);
    expect(screen.getByTestId('timeline-mock')).toBeInTheDocument();
    expect(screen.getByTestId('compose-post-mock')).toBeInTheDocument();
  });

  test('renders ComposePost component', () => {
    render(<Home />);
    expect(screen.getByTestId('compose-post-mock')).toBeInTheDocument();
    expect(screen.getByText('ComposePost Component')).toBeInTheDocument();
  });

  test('renders Timeline component', () => {
    render(<Home />);
    expect(screen.getByTestId('timeline-mock')).toBeInTheDocument();
    expect(screen.getByText('Timeline Component')).toBeInTheDocument();
  });

  test('ComposePost is rendered before Timeline', () => {
    const { container } = render(<Home />);
    const composePost = screen.getByTestId('compose-post-mock');
    const timeline = screen.getByTestId('timeline-mock');
    
    expect(composePost.compareDocumentPosition(timeline)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  test('ComposePost is wrapped in a container with correct styling', () => {
    const { container } = render(<Home />);
    const wrapper = container.querySelector('.bg-white.border-x.border-gray-200');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toContainElement(screen.getByTestId('compose-post-mock'));
  });
});
