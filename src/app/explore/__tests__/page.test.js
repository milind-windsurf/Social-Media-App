import { render, screen } from '@testing-library/react';
import Explore from '../page';

jest.mock('@/components/ExplorePage', () => ({
  ExplorePage: () => <div data-testid="explore-page-mock">ExplorePage</div>
}));

describe('Explore Page Route', () => {
  test('renders ExplorePage component', () => {
    render(<Explore />);
    
    expect(screen.getByTestId('explore-page-mock')).toBeInTheDocument();
  });

  test('renders without crashing', () => {
    const { container } = render(<Explore />);
    
    expect(container).toBeInTheDocument();
  });
});
