const BASE_URL = import.meta.env.VITE_OPEN_LIBRARY_URL || "https://openlibrary.org";

export interface OpenLibraryDoc {
    key?: string;
    title?: string;
    author_name?: string[];
    cover_i?: number;
    subject?: string[];
    language?: string[];
}

export const openLibraryEndpoints = {
    searchBooks: (query: string) => `${BASE_URL}/search.json?title=${encodeURIComponent(query)}`,
    getBookDetails: (isbn: string) => `${BASE_URL}/works/${isbn}.json`,
};
