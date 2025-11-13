import { render, screen } from '@testing-library/react';
import Messages from '../page';

jest.mock('@/components/MessagesPage', () => ({
  MessagesPage: () => <div data-testid="messages-page">MessagesPage</div>,
}));

describe('Messages Page', () => {
  it('renders without crashing', () => {
    render(<Messages />);
    expect(screen.getByTestId('messages-page')).toBeInTheDocument();
  });

  it('renders the MessagesPage component', () => {
    render(<Messages />);
    expect(screen.getByTestId('messages-page')).toBeInTheDocument();
  });

  it('returns MessagesPage component directly', () => {
    const { container } = render(<Messages />);
    expect(container.querySelector('[data-testid="messages-page"]')).toBeInTheDocument();
  });
});
