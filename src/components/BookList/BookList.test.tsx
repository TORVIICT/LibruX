import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookList } from './BookList';
import { useFetch } from '../../hooks/useFetch';
import { SearchContext } from '../../context/SearchContext';

vi.mock('../../hooks/useFetch', () => ({
  useFetch: vi.fn(),
}));

vi.mock('../CardBook/CardBook', () => ({
  CardBook: ({ title }: { title: string }) => (
    <div data-testid="mock-card-book">{title}</div>
  ),
}));

describe('BookList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithSearchContext = (searchValue = '') => {
    return render(
      <SearchContext.Provider value={{ search: searchValue, setSearch: vi.fn() }}>
        <BookList />
      </SearchContext.Provider>
    );
  };

  it('should render loading state when fetching data', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderWithSearchContext();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state when fetch fails', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network error'),
    });

    renderWithSearchContext();

    expect(screen.getByText('Error loading...')).toBeInTheDocument();
  });

  it('should render list of book cards when data is loaded', () => {
    const mockBooks = [
      { id: '1', title: 'The Fellowship of the Ring', cover_i: 101, author_name: ['Tolkien'], subject: ['Fantasy'], language: 'eng' },
      { id: '2', title: 'The Two Towers', cover_i: 102, author_name: ['Tolkien'], subject: ['Fantasy'], language: 'eng' },
    ];

    vi.mocked(useFetch).mockReturnValue({
      data: { docs: mockBooks },
      loading: false,
      error: null,
    });

    renderWithSearchContext();

    const bookCards = screen.getAllByTestId('mock-card-book');
    expect(bookCards).toHaveLength(2);
    expect(screen.getByText('The Fellowship of the Ring')).toBeInTheDocument();
    expect(screen.getByText('The Two Towers')).toBeInTheDocument();
  });

  it('should use default search query fantasy when search is empty', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: { docs: [] },
      loading: false,
      error: null,
    });

    renderWithSearchContext('');

    expect(useFetch).toHaveBeenCalledWith(
      expect.stringContaining('title=fantasy')
    );
  });

  it('should use contextual search query when provided', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: { docs: [] },
      loading: false,
      error: null,
    });

    renderWithSearchContext('react design');

    expect(useFetch).toHaveBeenCalledWith(
      expect.stringContaining('title=react%20design')
    );
  });
});
