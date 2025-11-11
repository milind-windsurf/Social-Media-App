import { render, screen } from '@testing-library/react';
import Home from '../page';

jest.mock('@/components/Timeline', () => ({
  Timeline: () => <div data-testid="timeline-mock">Timeline</div>
}));

jest.mock('@/components/ComposePost', () => ({
  ComposePost: () => <div data-testid="compose-post-mock">ComposePost</div>
}));

describe('Home Page', () => {
  test('renders ComposePost component', () => {
    render(<Home />);
    
    expect(screen.getByTestId('compose-post-mock')).toBeInTheDocument();
  });

  test('renders Timeline component', () => {
    render(<Home />);
    
    expect(screen.getByTestId('timeline-mock')).toBeInTheDocument();
  });

  test('renders both components', () => {
    render(<Home />);
    
    const composePost = screen.getByTestId('compose-post-mock');
    const timeline = screen.getByTestId('timeline-mock');
    
    expect(composePost).toBeInTheDocument();
    expect(timeline).toBeInTheDocument();
  });

  test('applies correct styling to ComposePost container', () => {
    const { container } = render(<Home />);
    
    const composePostContainer = container.querySelector('.bg-white.border-x.border-gray-200');
    expect(composePostContainer).toBeInTheDocument();
  });
});
