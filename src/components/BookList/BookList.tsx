import { CardBook } from "../CardBook/CardBook";
import "./BookList.scss";
import { openLibraryEndpoints } from "../../services/openlibrary.service";
import { useFetch } from "../../hooks/useFetch";

interface BookListProps {
    query?: string;
}

export function BookList({ query = "technology" }: BookListProps) {
    const { data, loading, error } = useFetch(
        openLibraryEndpoints.searchBooks(query));

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading...</div>;
    const books = data?.docs.slice(0, 16) || [];

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