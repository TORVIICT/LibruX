const BASE_URL = import.meta.env.VITE_OPEN_LIBRARY_URL || "https://openlibrary.org";

export interface OpenLibraryDoc {
    key?: string;
    title?: string;
    author_name?: string[];
    cover_i?: number;
    cover_edition_key?: string;
    subject?: string[];
    language?: string[];
    first_publish_year?: number;
    edition_count?: number;
    ratings_average?: number;
}

export const openLibraryEndpoints = {
    searchBooks: (query?: string, subject?: string, language?: string) => {
        const queryPart = query ? `title=${encodeURIComponent(query)}` : (!subject ? 'title=fantasy' : '');
        const subjectPart = subject ? `subject=${encodeURIComponent(subject)}` : '';
        const languagePart = language ? `language=${encodeURIComponent(language)}` : '';

        const parts = [queryPart, subjectPart, languagePart].filter(Boolean);
        return `${BASE_URL}/search.json?${parts.join('&')}`;
    },
    getBookDetails: (isbn: string) => `${BASE_URL}/works/${isbn}.json`,
    getRecentBooks: (limit: number = 10) => `${BASE_URL}/trending/daily.json?limit=${limit}`,
};
