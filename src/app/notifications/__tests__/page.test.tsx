import { render, screen } from '@testing-library/react';
import Notifications from '../page';

jest.mock('@/components/NotificationsPage', () => ({
  NotificationsPage: () => <div data-testid="notifications-page-mock">NotificationsPage</div>
}));

describe('Notifications Page Route', () => {
  test('renders NotificationsPage component', () => {
    render(<Notifications />);
    
    expect(screen.getByTestId('notifications-page-mock')).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<Notifications />);
    
    expect(container).toBeInTheDocument();
  });
});
