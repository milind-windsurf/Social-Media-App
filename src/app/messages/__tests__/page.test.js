import { render, screen } from '@testing-library/react';
import Messages from '../page';

jest.mock('@/components/MessagesPage', () => ({
  MessagesPage: () => <div data-testid="messages-page-mock">MessagesPage Component</div>
}));

describe('Messages Page Route', () => {
  test('renders the messages page', () => {
    render(<Messages />);
    expect(screen.getByTestId('messages-page-mock')).toBeInTheDocument();
  });

  test('renders MessagesPage component', () => {
    render(<Messages />);
    expect(screen.getByText('MessagesPage Component')).toBeInTheDocument();
  });

  test('returns MessagesPage component directly', () => {
    const { container } = render(<Messages />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'messages-page-mock');
  });
});
