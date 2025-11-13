import { render, screen } from '@testing-library/react';
import Notifications from '../page';

jest.mock('@/components/NotificationsPage', () => ({
  NotificationsPage: () => <div data-testid="notifications-page">NotificationsPage</div>,
}));

describe('Notifications Page', () => {
  it('renders without crashing', () => {
    render(<Notifications />);
    expect(screen.getByTestId('notifications-page')).toBeInTheDocument();
  });

  it('renders the NotificationsPage component', () => {
    render(<Notifications />);
    expect(screen.getByTestId('notifications-page')).toBeInTheDocument();
  });

  it('returns NotificationsPage component directly', () => {
    const { container } = render(<Notifications />);
    expect(container.querySelector('[data-testid="notifications-page"]')).toBeInTheDocument();
  });
});
