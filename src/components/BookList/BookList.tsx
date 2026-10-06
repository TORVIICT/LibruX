import { useEffect, useState, useMemo } from "react";
import { CardBook,  } from "../CardBook/CardBook";
import { searchBooks } from "../../services/openlibrary.service";
import "./BookList.scss";

interface BookListProps {
    query?: string;
}

interface CardBookProps {
    id: number | string;
    cover_i: number;
    title: string;
    author_name: string[];
    subject: string[];
    language: string;
}

export function BookList({ query = "technology" }: BookListProps) {
    const [books, setBooks] = useState<CardBookProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchBooks() {
            try {
                setLoading(true);
                setError(null);
                const data = await searchBooks(query);
                
                if (isMounted) {
                    if (data && data.docs && Array.isArray(data.docs)) {
                        const parsedBooks: CardBookProps[] = data.docs.slice(0, 16).map((doc: any, idx: number) => ({
                            id: doc.key || idx,
                            cover_i: doc.cover_i || 0,
                            title: doc.title || "Untitled Book",
                            author_name: doc.author_name || ["Unknown Author"],
                            subject: doc.subject || ["General"],
                            language: Array.isArray(doc.language) && doc.language.length > 0 
                                ? doc.language[0] 
                                : "English"
                        }));
                        setBooks(parsedBooks);
                    } else {
                        setBooks([]);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching books:", err);
                    setError("Failed to load books. Please try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchBooks();

        return () => {
            isMounted = false;
        };
    }, [query]);

    if (loading) {
        return (
            <div className="container-book-list loading">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div className="cardBook-skeleton" key={index}>
                        <div className="skeleton-img"></div>
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="book-list-status error">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="book-list-status empty">
                <span className="material-symbols-outlined">menu_book</span>
                <p>No books found for "{query}".</p>
            </div>
        );
    }

    return (
        <div className="container-book-list">
            {books.map((book) => (
                <CardBook
                    key={book.id}
                    id={book.id}
                    cover_i={book.cover_i}
                    title={book.title}
                    author_name={book.author_name}
                    subject={book.subject}
                    language={book.language}
                />
            ))}
        </div>
    );
}