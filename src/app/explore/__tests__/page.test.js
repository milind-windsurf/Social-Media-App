import { render, screen } from '@testing-library/react';
import Explore from '../page';

jest.mock('@/components/ExplorePage', () => ({
  ExplorePage: () => <div data-testid="explore-page-mock">ExplorePage Component</div>
}));

describe('Explore Page Route', () => {
  test('renders the explore page', () => {
    render(<Explore />);
    expect(screen.getByTestId('explore-page-mock')).toBeInTheDocument();
  });

  test('renders ExplorePage component', () => {
    render(<Explore />);
    expect(screen.getByText('ExplorePage Component')).toBeInTheDocument();
  });

  test('returns ExplorePage component directly', () => {
    const { container } = render(<Explore />);
    expect(container.firstChild).toHaveAttribute('data-testid', 'explore-page-mock');
  });
});
