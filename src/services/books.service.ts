import { supabase } from '../lib/supabase';
import type { BookReference } from './loans.service';

export interface BookToSave {
  openLibraryKey: string;
  title: string;
  authorName?: string[];
  coverId?: number;
  subject?: string[];
  language?: string;
  totalCopies?: number;
  availableCopies?: number;
}

interface BookReferenceRow {
  id: string;
  open_library_key: string;
  title: string;
  author_name: string[] | null;
  cover_id: number | null;
  subject: string[] | null;
  language: string | null;
  total_copies: number | null;
  available_copies: number | null;
}

const PRIMARY_STORAGE_KEY = 'librux_saved_books';
const LEGACY_STORAGE_KEY = 'librux_saved_books_backup';

function getLocalSavedBooks(): BookReference[] {
  try {
    const primary = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (primary) {
      return JSON.parse(primary);
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      return JSON.parse(legacy);
    }
  } catch {
    return [];
  }
  return [];
}

function setLocalSavedBooks(books: BookReference[]): void {
  try {
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(books));
  } catch (error: unknown) {
    void error;
  }
}

export const booksService = {
  async getSavedBooks(): Promise<BookReference[]> {
    const localBooks = getLocalSavedBooks();
    let dbBooks: BookReference[] = [];

    try {
      const { data, error } = await supabase
        .from('book_references')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<BookReferenceRow[]>();

      if (!error && data) {
        dbBooks = data.map((raw) => ({
          id: raw.id,
          openLibraryKey: raw.open_library_key,
          title: raw.title,
          authorName: raw.author_name || [],
          coverId: raw.cover_id || 0,
          subject: raw.subject || [],
          language: raw.language || 'eng',
          totalCopies: raw.total_copies ?? 5,
          availableCopies: raw.available_copies ?? 5,
        }));
      }
    } catch {
      dbBooks = [];
    }

    const bookMap = new Map<string, BookReference>();

    dbBooks.forEach((book) => {
      const normalizedKey = book.openLibraryKey.replace('/works/', '');
      bookMap.set(normalizedKey, book);
    });

    localBooks.forEach((book) => {
      const normalizedKey = book.openLibraryKey.replace('/works/', '');
      bookMap.set(normalizedKey, book);
    });

    const mergedBooks = Array.from(bookMap.values());
    setLocalSavedBooks(mergedBooks);
    return mergedBooks;
  },

  async isBookSaved(openLibraryKey: string): Promise<boolean> {
    const cleanKey = openLibraryKey.replace('/works/', '');
    const localBooks = getLocalSavedBooks();
    const inLocal = localBooks.some(
      (b) =>
        b.openLibraryKey === openLibraryKey ||
        b.openLibraryKey === cleanKey ||
        b.openLibraryKey.replace('/works/', '') === cleanKey
    );

    if (inLocal) {
      return true;
    }

    try {
      const { data } = await supabase
        .from('book_references')
        .select('id, open_library_key')
        .or(`open_library_key.eq.${openLibraryKey},open_library_key.eq.${cleanKey}`)
        .limit(1);

      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  },

  async saveBookReference(book: BookToSave): Promise<BookReference> {
    const rawKey = book.openLibraryKey;
    const cleanKey = rawKey.replace('/works/', '');
    const authorName = Array.isArray(book.authorName) ? book.authorName : [book.authorName || 'Desconocido'];
    const subject = Array.isArray(book.subject) ? book.subject : [book.subject || 'General'];

    const targetBook: BookReference = {
      id: `saved-${cleanKey}`,
      openLibraryKey: cleanKey,
      title: book.title,
      authorName,
      coverId: book.coverId || 0,
      subject,
      language: book.language || 'eng',
      totalCopies: book.totalCopies ?? 5,
      availableCopies: book.availableCopies ?? 5,
    };

    const currentBooks = getLocalSavedBooks();
    const existingIndex = currentBooks.findIndex(
      (b) =>
        b.openLibraryKey === cleanKey ||
        b.openLibraryKey === rawKey ||
        b.openLibraryKey.replace('/works/', '') === cleanKey
    );

    if (existingIndex >= 0) {
      currentBooks[existingIndex] = { ...currentBooks[existingIndex], ...targetBook };
    } else {
      currentBooks.unshift(targetBook);
    }
    setLocalSavedBooks(currentBooks);

    try {
      const { data: existing } = await supabase
        .from('book_references')
        .select('*')
        .or(`open_library_key.eq.${rawKey},open_library_key.eq.${cleanKey}`)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from('book_references')
          .insert({
            open_library_key: cleanKey,
            title: book.title,
            author_name: authorName,
            cover_id: book.coverId || 0,
            subject,
            language: book.language || 'eng',
            total_copies: book.totalCopies ?? 5,
            available_copies: book.availableCopies ?? 5,
          });
      }
    } catch (error: unknown) {
      void error;
    }

    return targetBook;
  },

  async removeBookReference(openLibraryKey: string): Promise<boolean> {
    const cleanKey = openLibraryKey.replace('/works/', '');
    const currentBooks = getLocalSavedBooks();
    const filtered = currentBooks.filter(
      (b) =>
        b.openLibraryKey !== openLibraryKey &&
        b.openLibraryKey !== cleanKey &&
        b.openLibraryKey.replace('/works/', '') !== cleanKey
    );
    setLocalSavedBooks(filtered);

    try {
      await supabase
        .from('book_references')
        .delete()
        .or(`open_library_key.eq.${openLibraryKey},open_library_key.eq.${cleanKey}`);
    } catch (error: unknown) {
      void error;
    }

    return true;
  },
};
