import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { booksService } from "../../services/books.service";
import type { BookReference } from "../../services/loans.service";
import { CardBook } from "../../components/CardBook/CardBook";
import "./FavoriteBooksPage.scss";

export default function FavoriteBooksPage() {
  const [savedBooks, setSavedBooks] = useState<BookReference[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadSavedBooks = useCallback(async () => {
    try {
      const data = await booksService.getSavedBooks();
      setSavedBooks(data);
    } catch (err: unknown) {
      console.error("Error loading saved books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initializeSavedBooks() {
      try {
        const data = await booksService.getSavedBooks();
        if (isMounted) {
          setSavedBooks(data);
        }
      } catch (err: unknown) {
        console.error("Error loading saved books:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    initializeSavedBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await loadSavedBooks();
  };

  return (
    <div className="saved-books-page">
      <header className="saved-books-header">
        <div className="header-title-area">
          <div className="header-icon">
            <span className="material-symbols-outlined">bookmarks</span>
          </div>
          <div className="header-text">
            <h1>Saved Books</h1>
            <p>Your personal collection of saved books and library references</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="count-badge">
            <span className="material-symbols-outlined">auto_stories</span>
            <span>{savedBooks.length} {savedBooks.length === 1 ? "book" : "books"}</span>
          </div>
          <button
            type="button"
            className="refresh-btn"
            onClick={handleRefresh}
            title="Recargar guardados"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading-state">
          <span className="material-symbols-outlined spinner">autorenew</span>
          <p>Loading your saved books...</p>
        </div>
      ) : savedBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <span className="material-symbols-outlined">bookmark_border</span>
          </div>
          <h3>You don't have any saved books yet</h3>
          <p>
            Explore the catalog or new acquisitions and click the save icon
            to keep your favorite references always at hand.
          </p>
          <button
            type="button"
            className="explore-btn"
            onClick={() => navigate("/books")}
          >
            <span className="material-symbols-outlined">explore</span>
            <span>Explore catalog</span>
          </button>
        </div>
      ) : (
        <div className="saved-books-grid">
          {savedBooks.map((book) => (
            <CardBook
              key={book.id || book.openLibraryKey}
              id={book.openLibraryKey}
              cover_i={book.coverId}
              title={book.title}
              author_name={book.authorName}
              subject={book.subject}
              language={book.language}
            />
          ))}
        </div>
      )}
    </div>
  );
}