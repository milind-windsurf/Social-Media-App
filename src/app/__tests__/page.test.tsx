import { render, screen } from '@testing-library/react';
import Home from '../page';

jest.mock('@/components/Timeline', () => ({
  Timeline: () => <div data-testid="timeline">Timeline</div>,
}));

jest.mock('@/components/ComposePost', () => ({
  ComposePost: () => <div data-testid="compose-post">ComposePost</div>,
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
    expect(screen.getByTestId('compose-post')).toBeInTheDocument();
  });

  it('renders the ComposePost component', () => {
    render(<Home />);
    expect(screen.getByTestId('compose-post')).toBeInTheDocument();
  });

  it('renders the Timeline component', () => {
    render(<Home />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('renders ComposePost before Timeline', () => {
    const { container } = render(<Home />);
    const composePost = screen.getByTestId('compose-post');
    const timeline = screen.getByTestId('timeline');
    
    const composePostPosition = Array.from(container.querySelectorAll('[data-testid]')).indexOf(composePost.closest('[data-testid]'));
    const timelinePosition = Array.from(container.querySelectorAll('[data-testid]')).indexOf(timeline.closest('[data-testid]'));
    
    expect(composePostPosition).toBeLessThan(timelinePosition);
  });

  it('wraps ComposePost in a container with correct styling', () => {
    const { container } = render(<Home />);
    const composePostContainer = container.querySelector('.bg-white.border-x.border-gray-200');
    expect(composePostContainer).toBeInTheDocument();
  });
});
