import { useMemo, useEffect, memo } from 'react';
import { CardBook } from '../CardBook/CardBook';
import './BookList.scss';
import { openLibraryEndpoints, type OpenLibraryDoc } from '../../services/openlibrary.service';
import { useFetch } from '../../hooks/useFetch';
import { useSearchContext } from '../../context/SearchContext';
import { filterBooks, type BookFiltersState, LANGUAGE_API_CODE_MAP } from '../../utils/filterBooks';
import { loansService } from '../../services/loans.service';

export interface BookListProps {
  filters?: BookFiltersState;
  onResetFilters?: () => void;
}

function BookListComponent({ filters, onResetFilters }: BookListProps = {}) {
  const { search } = useSearchContext();
  const DEFAULT_AUTHORS: string[] = Object.freeze(['Unknown Author']) as unknown as string[];
  const DEFAULT_SUBJECTS: string[] = Object.freeze(['General']) as unknown as string[];

  useEffect(() => {
    loansService.fetchAllRentedBooks();
  }, []);

  const selectedCategory =
    filters?.categories && filters.categories.length > 0
      ? filters.categories.join(',')
      : undefined;

  const selectedLanguage =
    filters?.languages && filters.languages.length > 0
      ? LANGUAGE_API_CODE_MAP[filters.languages[0].toLowerCase()] || filters.languages[0]
      : undefined;

  const { data, loading, error } = useFetch(
    openLibraryEndpoints.searchBooks(
      search || undefined,
      selectedCategory,
      selectedLanguage
    )
  );

  const books = useMemo(() => {
    const rawDocs: OpenLibraryDoc[] = data?.docs || [];
    if (!filters) {
      return rawDocs.slice(0, 16);
    }
    return filterBooks(rawDocs, {
      ...filters,
      categories: selectedCategory ? [] : filters.categories,
    }).slice(0, 16);
  }, [data, filters, selectedCategory]);

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Error loading...</div>;

  return (
    <div className="container-book-list">
      {books.length === 0 ? (
        <div className="book-list-status">
          <span className="material-symbols-outlined">search_off</span>
          <p>No books match your selected filters.</p>
          {onResetFilters && (
            <button
              type="button"
              className="btn-clear-filters"
              onClick={onResetFilters}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        books.map((book, index) => {
          const itemKey =
            book.key ||
            (book as { id?: string | number }).id?.toString() ||
            `book-${index}`;
          const authors = book.author_name && book.author_name.length > 0
            ? book.author_name
            : DEFAULT_AUTHORS;
          const subjects = book.subject && book.subject.length > 0
            ? book.subject
            : filters?.categories && filters.categories.length > 0
            ? filters.categories
            : DEFAULT_SUBJECTS;;
          const language = Array.isArray(book.language)
            ? book.language[0]
            : book.language || 'eng';

          return (
            <CardBook
              key={itemKey}
              id={itemKey}
              cover_i={book.cover_i ?? 0}
              title={book.title || 'Untitled'}
              author_name={authors}
              subject={subjects}
              language={language}
            />
          );
        })
      )}
    </div>
  );
}

export const BookList = memo(BookListComponent);