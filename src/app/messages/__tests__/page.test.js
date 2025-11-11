import { render, screen } from '@testing-library/react';
import Messages from '../page';

jest.mock('@/components/MessagesPage', () => ({
  MessagesPage: () => <div data-testid="messages-page-mock">MessagesPage</div>
}));

describe('Messages Page Route', () => {
  test('renders MessagesPage component', () => {
    render(<Messages />);
    
    expect(screen.getByTestId('messages-page-mock')).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<Messages />);
    
    expect(container).toBeInTheDocument();
  });
});
