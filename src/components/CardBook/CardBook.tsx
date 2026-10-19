import { memo, useState } from "react";
import { useNavigate } from "react-router";
import "./CardBook.scss";
import { loansService } from "../../services/loans.service";
import { SaveBookButton } from "../SaveBookButton/SaveBookButton";
import { useNotifications } from "../../context/NotificationContext";

export interface CardBookProps {
    id: number | string;
    cover_i: number;
    title: string;
    author_name: string[];
    subject: string[];
    language: string;
}

function CardBookComponent({id, cover_i, title, author_name, subject, language}: CardBookProps) {
    const [isRenting, setIsRenting] = useState(false);
    const [rentSuccess, setRentSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotifications();
    
    const navigate = useNavigate();
    const workId = String(id).replace('/works/', '');
    const coverImage = `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`;
    const formattedAuthor = Array.isArray(author_name) ? author_name.slice(0, 2).join(", ") : (author_name || "Unknown Author");
    const formattedSubject = Array.isArray(subject) ? subject.slice(0, 3).join(", ") : (subject || "General");

    const handleRent = async () => {
        try {
            setIsRenting(true);
            setError(null);
            
            await loansService.createLoan({
                bookDetails: {
                    openLibraryKey: workId,
                    title,
                    authorName: Array.isArray(author_name) ? author_name : [author_name || 'Unknown'],
                    coverId: cover_i || 0,
                    subject: Array.isArray(subject) ? subject : [subject || 'General'],
                    language: language || 'eng',
                },
                notes: 'Requested from digital catalog',
            });

            setRentSuccess(true);
            addNotification({
                title: 'Préstamo solicitado',
                message: `Has solicitado "${title}" exitosamente.`,
                type: 'success',
                link: '/loans',
            });
            setTimeout(() => setRentSuccess(false), 4000);
        } catch (err: any) {
            setError(err.message || 'Could not request loan');
            alert(`Error: ${err.message || 'Could not request loan'}`);
        } finally {
            setIsRenting(false);
        }
    };

    return (
        <section className="cardBook">
            <div className="cardBook-info">
                <div className="img-container">
                    <img 
                        src={coverImage}
                        alt={title}
                    />
                    <SaveBookButton
                        id={id}
                        title={title}
                        author_name={author_name}
                        cover_i={cover_i}
                        subject={subject}
                        language={language}
                        className="card-bookmark-btn"
                    />
                </div>

                <div>
                    <p>Availability</p>
                    <div className="rating">
                        <span className="material-symbols-outlined">star</span>
                        <p>4.9</p>
                    </div>
                </div>

                <div className="cardBook-info-text">
                    <h4>{title}</h4>
                    <p>{formattedAuthor}</p>
                    <p>{formattedSubject}</p>
                    <p>{language}</p>
                    {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
                </div>
            </div>

            <div className="cardBook-actions">
                <button 
                    className="rent-button" 
                    onClick={handleRent}
                    disabled={isRenting || rentSuccess}
                    style={rentSuccess ? { backgroundColor: '#2e7d32', color: 'white' } : {}}
                >
                    <span className="material-symbols-outlined">
                        {rentSuccess ? 'check_circle' : 'hand_package'}
                    </span>
                    {isRenting ? 'Requesting...' : rentSuccess ? 'Rented!' : 'Rent'}
                </button>
                <button
                    className="view-button"
                    onClick={() => navigate(`/books/${workId}`, {
                        state: {
                            title,
                            authorName: author_name,
                            coverI: cover_i,
                            subject,
                            language,
                        }
                    })}
                >
                    <span className="material-symbols-outlined">info</span>View more
                </button>
            </div>
        </section>
    );
}

export const CardBook = memo(CardBookComponent);