import { useState, useEffect, useCallback, memo } from "react";
import { booksService } from "../../services/books.service";
import { useNotifications } from "../../context/NotificationContext";
import "./SaveBookButton.scss";

export interface SaveBookButtonProps {
  id: string | number;
  title: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  language?: string;
  className?: string;
  showText?: boolean;
  onSavedChange?: (isSaved: boolean) => void;
}

function SaveBookButtonComponent({
  id,
  title,
  author_name,
  cover_i,
  subject,
  language,
  className = "",
  showText = false,
  onSavedChange,
}: SaveBookButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  const key = String(id);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const saved = await booksService.isBookSaved(key);
        if (isMounted) setIsSaved(saved);
      } catch {
        console.log("Error in checkStatus savebookbutton");
      }
    }
    if (key) {
      checkStatus();
    }
    return () => {
      isMounted = false;
    };
  }, [key]);

  const handleToggleSave = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (loading) return;

      try {
        setLoading(true);
        if (isSaved) {
          // Remove from saved
          await booksService.removeBookReference(key);
          setIsSaved(false);
          onSavedChange?.(false);
          addNotification({
            title: "Book removed",
            message: `"${title}" has been removed from your saved books.`,
            type: "info",
          });
        } else {
          await booksService.saveBookReference({
            openLibraryKey: key,
            title,
            authorName: Array.isArray(author_name) ? author_name : [author_name || "Desconocido"],
            coverId: cover_i || 0,
            subject: Array.isArray(subject) ? subject : [subject || "General"],
            language: language || "eng",
          });
          setIsSaved(true);
          onSavedChange?.(true);
          addNotification({
            title: "Libro guardado",
            message: `"${title}" se guardó exitosamente en tus referencias.`,
            type: "success",
            link: "/saved-books",
          });
        }
      } catch (err: any) {
        console.error("Error at savebookbutton", err);
      } finally {
        setLoading(false);
      }
    },
    [isSaved, loading, key, title, author_name, cover_i, subject, language, onSavedChange, addNotification]
  );

  return (
    <button
      type="button"
      className={`save-book-btn ${isSaved ? "saved" : ""} ${loading ? "loading" : ""} ${className}`}
      onClick={handleToggleSave}
      title={isSaved ? "Remove from saved" : "Save book"}
      aria-label={isSaved ? "Remove from saved" : "Save book"}
      disabled={loading}
    >
      <span className={`material-symbols-outlined ${isSaved ? "icon-filled" : ""}`}>
        {loading ? "progress_activity" : isSaved ? "bookmark" : "bookmark_add"}
      </span>
      {showText && (
        <span className="save-book-text">
          {loading ? "Saving..." : isSaved ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}

export const SaveBookButton = memo(SaveBookButtonComponent);
