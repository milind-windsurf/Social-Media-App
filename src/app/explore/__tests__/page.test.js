import { render, screen } from '@testing-library/react';
import Explore from '../page';

jest.mock('@/components/ExplorePage', () => ({
  ExplorePage: () => <div data-testid="explore-page">ExplorePage</div>,
}));

describe('Explore Page', () => {
  it('renders without crashing', () => {
    render(<Explore />);
    expect(screen.getByTestId('explore-page')).toBeInTheDocument();
  });

  it('renders the ExplorePage component', () => {
    render(<Explore />);
    expect(screen.getByTestId('explore-page')).toBeInTheDocument();
  });

  it('returns ExplorePage component directly', () => {
    const { container } = render(<Explore />);
    expect(container.querySelector('[data-testid="explore-page"]')).toBeInTheDocument();
  });
});
