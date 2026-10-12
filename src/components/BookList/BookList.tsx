import { CardBook } from "../CardBook/CardBook";
import "./BookList.scss";
import { openLibraryEndpoints } from "../../services/openlibrary.service";
import { useFetch } from "../../hooks/useFetch";
import { useMemo } from "react";
import { useSearchContext } from "../../context/SearchContext";

export function BookList() {
    const { search } = useSearchContext();
    const { data, loading, error } = useFetch(
        openLibraryEndpoints.searchBooks(search || 'fantasy'));

    if (loading) return <div>Loading...</div>;

    if (error) return <div>Error loading...</div>;

    const books = useMemo(() => {
        return data?.docs.slice(0, 16) || [];
    }, [data]);

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