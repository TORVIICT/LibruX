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

export const booksService = {
  /**
   * Obtiene todos los libros guardados en la base de datos (book_references)
   */
  async getSavedBooks(): Promise<BookReference[]> {
    const { data, error } = await supabase
      .from('book_references')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching saved books from Supabase:', error.message);
      // Fallback a almacenamiento local si la política RLS aún no está activa
      const local = localStorage.getItem('librux_saved_books_backup');
      return local ? JSON.parse(local) : [];
    }

    const mapped: BookReference[] = (data || []).map((raw) => ({
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

    // Sincronizar respaldo local
    localStorage.setItem('librux_saved_books_backup', JSON.stringify(mapped));
    return mapped;
  },

  /**
   * Verifica si un libro está guardado por su openLibraryKey
   */
  async isBookSaved(openLibraryKey: string): Promise<boolean> {
    const cleanKey = openLibraryKey.replace('/works/', '');
    const { data, error } = await supabase
      .from('book_references')
      .select('id, open_library_key')
      .or(`open_library_key.eq.${openLibraryKey},open_library_key.eq.${cleanKey}`)
      .limit(1);

    if (error) {
      const local = localStorage.getItem('librux_saved_books_backup');
      if (local) {
        const books: BookReference[] = JSON.parse(local);
        return books.some(b => b.openLibraryKey === openLibraryKey || b.openLibraryKey === cleanKey);
      }
      return false;
    }

    return (data && data.length > 0);
  },

  /**
   * Guarda la referencia del libro en la base de datos Supabase
   */
  async saveBookReference(book: BookToSave): Promise<BookReference> {
    const key = book.openLibraryKey;
    const authorName = Array.isArray(book.authorName) ? book.authorName : [book.authorName || 'Desconocido'];
    const subject = Array.isArray(book.subject) ? book.subject : [book.subject || 'General'];

    // 1. Verificar si ya existe
    const { data: existing } = await supabase
      .from('book_references')
      .select('*')
      .eq('open_library_key', key)
      .maybeSingle();

    if (existing) {
      return {
        id: existing.id,
        openLibraryKey: existing.open_library_key,
        title: existing.title,
        authorName: existing.author_name || [],
        coverId: existing.cover_id || 0,
        subject: existing.subject || [],
        language: existing.language || 'eng',
        totalCopies: existing.total_copies ?? 5,
        availableCopies: existing.available_copies ?? 5,
      };
    }

    // 2. Insertar nueva referencia en Supabase
    const { data, error } = await supabase
      .from('book_references')
      .insert({
        open_library_key: key,
        title: book.title,
        author_name: authorName,
        cover_id: book.coverId || 0,
        subject: subject,
        language: book.language || 'eng',
        total_copies: book.totalCopies ?? 5,
        available_copies: book.availableCopies ?? 5,
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase RLS/Insert warning:', error.message);
      // Si falla por RLS, guardamos localmente como resguardo transparente
      const fallbackBook: BookReference = {
        id: `local-${Date.now()}`,
        openLibraryKey: key,
        title: book.title,
        authorName,
        coverId: book.coverId || 0,
        subject,
        language: book.language || 'eng',
        totalCopies: 5,
        availableCopies: 5,
      };

      const local = localStorage.getItem('librux_saved_books_backup');
      const books: BookReference[] = local ? JSON.parse(local) : [];
      if (!books.some(b => b.openLibraryKey === key)) {
        books.unshift(fallbackBook);
        localStorage.setItem('librux_saved_books_backup', JSON.stringify(books));
      }
      return fallbackBook;
    }

    const savedBook: BookReference = {
      id: data.id,
      openLibraryKey: data.open_library_key,
      title: data.title,
      authorName: data.author_name || [],
      coverId: data.cover_id || 0,
      subject: data.subject || [],
      language: data.language || 'eng',
      totalCopies: data.total_copies ?? 5,
      availableCopies: data.available_copies ?? 5,
    };

    // Actualizar respaldo local
    const local = localStorage.getItem('librux_saved_books_backup');
    const books: BookReference[] = local ? JSON.parse(local) : [];
    if (!books.some(b => b.openLibraryKey === key)) {
      books.unshift(savedBook);
      localStorage.setItem('librux_saved_books_backup', JSON.stringify(books));
    }

    return savedBook;
  },

  /**
   * Elimina un libro guardado de la base de datos
   */
  async removeBookReference(openLibraryKey: string): Promise<boolean> {
    const { error } = await supabase
      .from('book_references')
      .delete()
      .eq('open_library_key', openLibraryKey);

    // Actualizar respaldo local independientemente
    const local = localStorage.getItem('librux_saved_books_backup');
    if (local) {
      const books: BookReference[] = JSON.parse(local);
      const filtered = books.filter(b => b.openLibraryKey !== openLibraryKey);
      localStorage.setItem('librux_saved_books_backup', JSON.stringify(filtered));
    }

    if (error) {
      console.warn('Error deleting book reference from Supabase:', error.message);
    }

    return true;
  },
};
