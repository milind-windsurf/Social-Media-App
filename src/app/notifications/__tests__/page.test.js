import { render, screen } from '@testing-library/react';
import Notifications from '../page';

jest.mock('@/components/NotificationsPage', () => ({
  NotificationsPage: () => <div data-testid="notifications-page-mock">NotificationsPage Component</div>
}));

describe('Notifications Page Route', () => {
  test('renders the notifications page', () => {
    render(<Notifications />);
    expect(screen.getByTestId('notifications-page-mock')).toBeInTheDocument();
  });

  test('renders NotificationsPage component', () => {
    render(<Notifications />);
    expect(screen.getByText('NotificationsPage Component')).toBeInTheDocument();
  });

  test('returns NotificationsPage component directly', () => {
    const { container } = render(<Notifications />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'notifications-page-mock');
  });
});
