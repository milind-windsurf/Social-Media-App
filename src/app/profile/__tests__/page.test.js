import { render, screen } from '@testing-library/react';
import Profile from '../page';

jest.mock('@/components/ProfilePage', () => ({
  ProfilePage: () => <div data-testid="profile-page-mock">ProfilePage</div>
}));

describe('Profile Page Route', () => {
  test('renders ProfilePage component', () => {
    render(<Profile />);
    
    expect(screen.getByTestId('profile-page-mock')).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<Profile />);
    
    expect(container).toBeInTheDocument();
  });
});
