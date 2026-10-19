import { useParams, useNavigate, useLocation } from "react-router";
import { useFetch } from "../../hooks/useFetch";
import { openLibraryEndpoints } from "../../services/openlibrary.service";
import { useState, useEffect } from "react";
import { SaveBookButton } from "../../components/SaveBookButton/SaveBookButton";
import { loansService } from "../../services/loans.service";
import { useNotifications } from "../../context/NotificationContext";
import "./BookPage.scss";

function getDescription(desc: any): string {
    if (!desc) return "No description available for this book.";
    if (typeof desc === "string") return desc;
    if (typeof desc === "object" && desc.value) return desc.value;
    return "No description available for this book.";
}

export default function BookPage() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const stateData = location.state as {
        title?: string;
        authorName?: string[];
        coverI?: number;
        subject?: string[];
        language?: string;
    } | null;

    const { data, loading, error } = useFetch(
        openLibraryEndpoints.getBookDetails(bookId || "")
    );
    
    const [authors, setAuthors] = useState<string[]>(stateData?.authorName || []);
    const [isRenting, setIsRenting] = useState(false);
    const [rentSuccess, setRentSuccess] = useState(false);
    const { addNotification } = useNotifications();

    useEffect(() => {
        if (data?.authors && authors.length === 0) {
            const fetchAuthors = async () => {
                try {
                    const authorPromises = data.authors.slice(0, 3).map(async (a: any) => {
                        const res = await fetch(`https://openlibrary.org${a.author.key}.json`);
                        const authorData = await res.json();
                        return authorData.name || "Unknown Author";
                    });
                    const names = await Promise.all(authorPromises);
                    setAuthors(names);
                } catch {
                    setAuthors(["Unknown Author"]);
                }
            };
            fetchAuthors();
        }
    }, [data]);

    const handleRent = async () => {
        if (!data && !stateData) return;
        try {
            setIsRenting(true);
            await loansService.createLoan({
                bookDetails: {
                    openLibraryKey: bookId || "",
                    title: data?.title || stateData?.title || "Unknown",
                    authorName: authors,
                    coverId: stateData?.coverI || (data?.covers?.[0]) || 0,
                    subject: data?.subjects?.slice(0, 5) || stateData?.subject || [],
                    language: stateData?.language || "eng",
                },
                notes: "Requested from book detail page",
            });
            setRentSuccess(true);
            addNotification({
                title: "Préstamo solicitado",
                message: `Has solicitado "${data?.title || stateData?.title}" exitosamente.`,
                type: "success",
                link: "/loans",
            });
            setTimeout(() => setRentSuccess(false), 4000);
        } catch (err: any) {
            alert(`Error: ${err.message || "Could not request loan"}`);
        } finally {
            setIsRenting(false);
        }
    };

    if (loading) {
        return (
            <div className="book-page-loading">
                <div className="spinner"></div>
                <p>Loading book details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="book-page-error">
                <span className="material-symbols-outlined">error</span>
                <h2>Could not load book</h2>
                <p>There was a problem loading this book. Please try again later.</p>
                <button onClick={() => navigate("/books")}>Back to Books</button>
            </div>
        );
    }

    const title = data?.title || stateData?.title || "Unknown Title";
    const description = getDescription(data?.description);
    const coverId = stateData?.coverI || data?.covers?.[0];
    const coverUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : null;
    const subjects = data?.subjects?.slice(0, 8) || stateData?.subject || [];
    const publishDate = data?.first_publish_date || "Unknown";

    return (
        <div className="book-page">
            <button className="back-button" onClick={() => navigate("/books")}>
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Books
            </button>

            <div className="book-detail-container">
                <div className="book-cover-section">
                    {coverUrl ? (
                        <img src={coverUrl} alt={title} className="book-cover" />
                    ) : (
                        <div className="book-cover-placeholder">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                    )}

                    <div className="book-actions">
                        <button
                            className={`rent-btn ${rentSuccess ? "success" : ""}`}
                            onClick={handleRent}
                            disabled={isRenting || rentSuccess}
                        >
                            <span className="material-symbols-outlined">
                                {rentSuccess ? "check_circle" : "local_library"}
                            </span>
                            {isRenting ? "Requesting..." : rentSuccess ? "Rented!" : "Rent this Book"}
                        </button>

                        <SaveBookButton
                            id={bookId || ""}
                            title={title}
                            author_name={authors}
                            cover_i={coverId || 0}
                            subject={subjects}
                            language={stateData?.language || "eng"}
                            className="detail-save-btn"
                            showText={true}
                        />
                    </div>
                </div>

                <div className="book-info-section">
                    <h1 className="book-title">{title}</h1>

                    <p className="book-authors">
                        <span className="material-symbols-outlined">person</span>
                        {authors.length > 0 ? authors.join(", ") : "Loading authors..."}
                    </p>

                    <div className="book-meta">
                        <span className="meta-item">
                            <span className="material-symbols-outlined">calendar_month</span>
                            {publishDate}
                        </span>
                        <span className="meta-item">
                            <span className="material-symbols-outlined">language</span>
                            {stateData?.language || "eng"}
                        </span>
                    </div>

                    <div className="book-description">
                        <h3>Description</h3>
                        <p>{description}</p>
                    </div>

                    {subjects.length > 0 && (
                        <div className="book-subjects">
                            <h3>Subjects</h3>
                            <div className="subject-tags">
                                {subjects.map((subj: string, index: number) => (
                                    <span key={index} className="subject-tag">{subj}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}