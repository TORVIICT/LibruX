import { useNavigate } from "react-router";
import { useFetch } from "../../hooks/useFetch";
import { openLibraryEndpoints, type OpenLibraryDoc } from "../../services/openlibrary.service";
import { SaveBookButton } from "../SaveBookButton/SaveBookButton";
import "./NewAcquisitions.scss";
import { memo } from "react";

export default memo(function NewAcquisitions() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(openLibraryEndpoints.getRecentBooks(10));
  const rawBooks: OpenLibraryDoc[] = data?.works || data?.docs || [];
  const recentBooks: OpenLibraryDoc[] = rawBooks.slice(0, 5);

  return (
    <div className="library-insights">
      <div className="library-insights-header">
        <div className="library-insights-header-info">
          <span className="material-symbols-outlined">add_diamond</span>
          <h3>New acquisitions</h3>
        </div>
        <span className="insights-badge">newly admitted</span>
      </div>

      <div className="library-insights-body">
        {loading ? (
          <div className="acquisitions-loading">
            <span className="material-symbols-outlined">
              autorenew
            </span>
            <p>Loading recent books...</p>
          </div>
        ) : error ? (
          <p className="acquisitions-error">
            Could not load recent acquisitions.
          </p>
        ) : recentBooks.length === 0 ? (
          <p className="acquisitions-empty">
            No recent books found.
          </p>
        ) : (
          <ul className="acquisitions-list">
            {recentBooks.map((book: OpenLibraryDoc, index: number) => {
              const bookKey = book.key ? book.key.replace("/works/", "") : `book-${index}`;
              const authors = Array.isArray(book.author_name) ? book.author_name.slice(0, 2).join(", ") : (book.author_name || "Unknown Author");
              const meta = book.first_publish_year ? `Edición ${book.first_publish_year} • Digital Ready` : "Digital Ready";
              const coverUrl = book.cover_i && Number(book.cover_i) > 0
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : book.cover_edition_key
                ? `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`
                : null;

              return (
                <li key={bookKey} className="acquisition-item">
                  <div className="acquisition-cover-wrap">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={`${book.title || "Book"} cover`}
                        className="acquisition-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.classList.add("is-hidden");
                          const placeholder = event.currentTarget.nextElementSibling;
                          if (placeholder) {
                            placeholder.classList.remove("is-hidden");
                          }
                        }}
                      />
                    ) : null}
                    <div className={`acquisition-cover-placeholder ${coverUrl ? "is-hidden" : ""}`} aria-hidden="true">
                      <span className="material-symbols-outlined">menu_book</span>
                    </div>
                  </div>
                  <div className="acquisition-info">
                    <h4>{book.title}</h4>
                    <p className="acquisition-author">{authors}</p>
                    <p className="acquisition-meta">{meta}</p>
                  </div>
                  <SaveBookButton
                    id={bookKey}
                    title={book.title || "Unknown Title"}
                    author_name={book.author_name}
                    cover_i={book.cover_i || 0}
                    subject={book.subject}
                    language={Array.isArray(book.language) ? book.language[0] : (book.language as string | undefined)}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <button
          className="explore-catalog-btn"
          onClick={() => navigate("/books")}
        >
          <span>Explorar catálogo completo</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
});
