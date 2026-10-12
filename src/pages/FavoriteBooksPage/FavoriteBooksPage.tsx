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
      setLoading(true);
      const data = await booksService.getSavedBooks();
      setSavedBooks(data);
    } catch (err) {
      console.error("Error loading saved books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedBooks();
  }, [loadSavedBooks]);

  return (
    <div className="saved-books-page">
      <header className="saved-books-header">
        <div className="header-title-area">
          <div className="header-icon">
            <span className="material-symbols-outlined">bookmarks</span>
          </div>
          <div className="header-text">
            <h1>Saved Books</h1>
            <p>Tu colección personal de libros guardados y referencias de biblioteca</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="count-badge">
            <span className="material-symbols-outlined">auto_stories</span>
            <span>{savedBooks.length} {savedBooks.length === 1 ? "libro" : "libros"}</span>
          </div>
          <button 
            type="button" 
            className="refresh-btn" 
            onClick={loadSavedBooks}
            title="Recargar guardados"
          >
            <span className="material-symbols-outlined">refresh</span>
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading-state">
          <span className="material-symbols-outlined spinner">autorenew</span>
          <p>Cargando tus libros guardados...</p>
        </div>
      ) : savedBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <span className="material-symbols-outlined">bookmark_border</span>
          </div>
          <h3>No tienes libros guardados aún</h3>
          <p>
            Explora el catálogo o las nuevas adquisiciones y haz clic en el ícono de
            guardar para tener tus referencias favoritas siempre a mano.
          </p>
          <button 
            type="button" 
            className="explore-btn"
            onClick={() => navigate("/books")}
          >
            <span className="material-symbols-outlined">explore</span>
            <span>Explorar catálogo</span>
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