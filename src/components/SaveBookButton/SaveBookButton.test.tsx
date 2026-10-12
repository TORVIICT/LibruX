import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveBookButton } from './SaveBookButton';
import { booksService } from '../../services/books.service';

vi.mock('../../services/books.service', () => ({
  booksService: {
    isBookSaved: vi.fn(),
    saveBookReference: vi.fn(),
    removeBookReference: vi.fn(),
  },
}));

describe('SaveBookButton', () => {
  const defaultProps = {
    id: 'OL1234M',
    title: 'Clean Code',
    author_name: ['Robert C. Martin'],
    cover_i: 12345,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with bookmark_add icon when not saved', async () => {
    vi.mocked(booksService.isBookSaved).mockResolvedValueOnce(false);

    render(<SaveBookButton {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('bookmark_add')).toBeInTheDocument();
    });
  });

  it('saves book reference when clicked while unsaved', async () => {
    vi.mocked(booksService.isBookSaved).mockResolvedValueOnce(false);
    vi.mocked(booksService.saveBookReference).mockResolvedValueOnce({} as any);

    render(<SaveBookButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(booksService.saveBookReference).toHaveBeenCalledWith({
        openLibraryKey: 'OL1234M',
        title: 'Clean Code',
        authorName: ['Robert C. Martin'],
        coverId: 12345,
        subject: ['General'],
        language: 'eng',
      });
    });
  });

  it('removes book reference when clicked while already saved', async () => {
    vi.mocked(booksService.isBookSaved).mockResolvedValueOnce(true);
    vi.mocked(booksService.removeBookReference).mockResolvedValueOnce(true);

    render(<SaveBookButton {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('bookmark')).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(booksService.removeBookReference).toHaveBeenCalledWith('OL1234M');
    });
  });
});
