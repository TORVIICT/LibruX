import type { OpenLibraryDoc } from '../services/openlibrary.service';

export type AvailabilityFilter = 'all' | 'available' | 'not-available';

export interface BookFiltersState {
  categories: string[];
  availability: AvailabilityFilter;
  minRating: number;
  languages: string[];
}

export const INITIAL_FILTERS: BookFiltersState = {
  categories: [],
  availability: 'all',
  minRating: 0,
  languages: [],
};

export const LANGUAGE_API_CODE_MAP: Record<string, string> = {
  spanish: 'spa',
  english: 'eng',
  french: 'fre',
  german: 'ger',
  italian: 'ita',
};

const LANGUAGE_CODE_MAP: Record<string, string[]> = {
  spanish: ['spa', 'es', 'es-es', 'es-419', 'spanish'],
  english: ['eng', 'en', 'en-us', 'en-gb', 'english'],
  french: ['fre', 'fra', 'fr', 'french'],
  german: ['ger', 'deu', 'de', 'german'],
  italian: ['ita', 'it', 'italian'],
};

export function filterBooks(
  books: OpenLibraryDoc[],
  filters: BookFiltersState
): OpenLibraryDoc[] {
  return books.filter((book) => {
    if (filters.categories.length > 0) {
      const bookSubjects = (book.subject || []).map((subject) =>
        subject.toLowerCase()
      );
      const bookTitle = (book.title || '').toLowerCase();
      const hasSubjectMetadata = bookSubjects.length > 0;

      if (hasSubjectMetadata) {
        const matchesCategory = filters.categories.some((category) => {
          const normalizedCategory = category.toLowerCase();
          return (
            bookSubjects.some((subject) =>
              subject.includes(normalizedCategory)
            ) || bookTitle.includes(normalizedCategory)
          );
        });

        if (!matchesCategory) {
          return false;
        }
      }
    }

    if (filters.languages.length > 0) {
      const bookLanguages: string[] = Array.isArray(book.language)
        ? book.language.map((lang) => lang.toLowerCase())
        : typeof book.language === 'string'
        ? [(book.language as string).toLowerCase()]
        : [];

      const matchesLanguage = filters.languages.some((lang) => {
        const acceptableCodes =
          LANGUAGE_CODE_MAP[lang.toLowerCase()] || [lang.toLowerCase()];
        return bookLanguages.some((bookLang) =>
          acceptableCodes.includes(bookLang)
        );
      });

      if (!matchesLanguage && bookLanguages.length > 0) {
        return false;
      }
    }

    if (filters.availability === 'available') {
      const isAvailable =
        Boolean(book.cover_i && book.cover_i > 0) ||
        Boolean(book.edition_count && book.edition_count > 0);
      if (!isAvailable) {
        return false;
      }
    } else if (filters.availability === 'not-available') {
      const isAvailable =
        Boolean(book.cover_i && book.cover_i > 0) ||
        Boolean(book.edition_count && book.edition_count > 0);
      if (isAvailable) {
        return false;
      }
    }

    if (filters.minRating > 0) {
      const rating =
        (book as { ratings_average?: number }).ratings_average ?? 4.5;
      if (rating < filters.minRating) {
        return false;
      }
    }

    return true;
  });
}
