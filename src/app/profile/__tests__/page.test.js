import { render, screen } from '@testing-library/react';
import Profile from '../page';

jest.mock('@/components/ProfilePage', () => ({
  ProfilePage: () => <div data-testid="profile-page-mock">ProfilePage Component</div>
}));

describe('Profile Page Route', () => {
  test('renders the profile page', () => {
    render(<Profile />);
    expect(screen.getByTestId('profile-page-mock')).toBeInTheDocument();
  });

  test('renders ProfilePage component', () => {
    render(<Profile />);
    expect(screen.getByText('ProfilePage Component')).toBeInTheDocument();
  });

  test('returns ProfilePage component directly', () => {
    const { container } = render(<Profile />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'profile-page-mock');
  });
});
