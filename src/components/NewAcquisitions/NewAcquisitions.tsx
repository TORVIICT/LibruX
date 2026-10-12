import { useNavigate } from "react-router";
import { useFetch } from "../../hooks/useFetch";
import { openLibraryEndpoints } from "../../services/openlibrary.service";
import { SaveBookButton } from "../SaveBookButton/SaveBookButton";
import "./NewAcquisitions.scss";
import { memo } from "react";

export default memo(function NewAcquisitions() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(openLibraryEndpoints.getRecentBooks(5));
  const recentBooks = data?.docs?.slice(0, 5) || [];

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
          <div >
            <span className="material-symbols-outlined" >
              autorenew
            </span>
            <p>Loading recent books...</p>
          </div>
        ) : error ? (
          <p >
            Could not load recent acquisitions.
          </p>
        ) : recentBooks.length === 0 ? (
          <p>
            No recent books found.
          </p>
        ) : (
          <ul className="acquisitions-list">
            {recentBooks.map((book: any, index: number) => {
              const bookKey = book.key ? book.key.replace("/works/", "") : `book-${index}`;
              const authors = Array.isArray(book.author_name) ? book.author_name.slice(0, 2).join(", ") : (book.author_name || "Unknown Author");
              const meta = book.first_publish_year ? `Edición ${book.first_publish_year} • Digital Ready` : "Digital Ready";
              const coverImage = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;

              console.log(book.cover_i);

              return (
                <li key={bookKey} className="acquisition-item">
                  <img
                    src={coverImage}
                    alt={"image book"}
                  />
                  <div className="acquisition-info">
                    <h4>{book.title}</h4>
                    <p className="acquisition-author">{authors}</p>
                    <p className="acquisition-meta">{meta}</p>
                  </div>
                  <SaveBookButton
                    id={bookKey}
                    title={book.title}
                    author_name={book.author_name}
                    cover_i={book.cover_i}
                    subject={book.subject}
                    language={Array.isArray(book.language) ? book.language[0] : book.language}
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
