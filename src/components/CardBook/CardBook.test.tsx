import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { CardBook } from './CardBook';
import { loansService, type Loan } from '../../services/loans.service';

vi.mock('../../services/loans.service', () => ({
  loansService: {
    createLoan: vi.fn(),
  },
}));

describe('CardBook', () => {
  const defaultProps = {
    id: 'OL12345M',
    cover_i: 1001,
    title: 'The Hobbit',
    author_name: ['J.R.R. Tolkien'],
    subject: ['Fantasy', 'Adventure'],
    language: 'English',
  };

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should render book details correctly', () => {
    renderWithRouter(<CardBook {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 4, name: 'The Hobbit' })).toBeInTheDocument();
    expect(screen.getByText('J.R.R. Tolkien')).toBeInTheDocument();
    expect(screen.getByText('Fantasy, Adventure')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();

    const img = screen.getByRole('img', { name: 'The Hobbit' });
    expect(img).toHaveAttribute('src', 'https://covers.openlibrary.org/b/id/1001-M.jpg');
  });

  it('should handle fallback author and subject when empty', () => {
    renderWithRouter(
      <CardBook
        id="OL999"
        cover_i={0}
        title="Unknown Book"
        author_name={[]}
        subject={[]}
        language="spa"
      />
    );

    expect(screen.getByRole('heading', { level: 4, name: 'Unknown Book' })).toBeInTheDocument();
  });

  it('should trigger createLoan and display rented state on click', async () => {
    vi.mocked(loansService.createLoan).mockResolvedValueOnce({} as Loan);

    renderWithRouter(<CardBook {...defaultProps} />);

    const rentButton = screen.getByRole('button', { name: /rent/i });
    expect(rentButton).toBeInTheDocument();
    expect(rentButton).not.toBeDisabled();

    fireEvent.click(rentButton);

    expect(loansService.createLoan).toHaveBeenCalledTimes(1);
    expect(loansService.createLoan).toHaveBeenCalledWith({
      bookDetails: {
        openLibraryKey: 'OL12345M',
        title: 'The Hobbit',
        authorName: ['J.R.R. Tolkien'],
        coverId: 1001,
        subject: ['Fantasy', 'Adventure'],
        language: 'English',
      },
      notes: 'Requested from digital catalog',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /rented!/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /rented!/i })).toBeDisabled();
  });

  it('should display error message when createLoan fails', async () => {
    vi.mocked(loansService.createLoan).mockRejectedValueOnce(new Error('Loan quota exceeded'));

    renderWithRouter(<CardBook {...defaultProps} />);

    const rentButton = screen.getByRole('button', { name: /rent/i });
    fireEvent.click(rentButton);

    await waitFor(() => {
      expect(screen.getByText('Loan quota exceeded')).toBeInTheDocument();
    });
    expect(window.alert).toHaveBeenCalledWith('Error: Loan quota exceeded');
  });

  it('should fallback image source on image load error', () => {
    renderWithRouter(<CardBook {...defaultProps} />);

    const img = screen.getByRole('img', { name: 'The Hobbit' });
    fireEvent.error(img);

    expect(img).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80'
    );
  });
});
