import { memo, useState, useEffect } from "react";
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

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80';

function CardBookComponent({id, cover_i, title, author_name, subject, language}: CardBookProps) {
    const workId = String(id).replace('/works/', '').trim();
    const [isRented, setIsRented] = useState<boolean>(() => loansService.isBookRentedSync(workId));
    const [isRenting, setIsRenting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initialCover = cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : FALLBACK_COVER;
    const [coverImage, setCoverImage] = useState(initialCover);
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const formattedAuthor = Array.isArray(author_name) ? author_name.slice(0, 2).join(", ") : (author_name || "Unknown Author");
    const formattedSubject = Array.isArray(subject) ? subject.slice(0, 3).join(", ") : (subject || "General");

    useEffect(() => {
        let isMounted = true;
        loansService.isBookRented(workId).then((rented) => {
            if (isMounted) {
                setIsRented(rented);
            }
        });

        const unsubscribe = loansService.subscribeToRentalChanges(workId, (rented) => {
            if (isMounted) {
                setIsRented(rented);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [workId]);

    const handleRent = async () => {
        if (isRented || isRenting) return;
        try {
            setIsRenting(true);
            setError(null);
            
            await loansService.createLoan({
                bookDetails: {
                    openLibraryKey: workId,
                    title,
                    authorName: Array.isArray(author_name) ? author_name : [author_name || 'Unknown Author'],
                    coverId: cover_i || 0,
                    subject: Array.isArray(subject) ? subject : [subject || 'General'],
                    language: language || 'eng',
                    totalCopies: 1,
                },
                notes: 'Requested from digital catalog',
            });

            setIsRented(true);
            addNotification({
                title: 'Loan requested',
                message: `You have successfully requested "${title}".`,
                type: 'success',
                link: '/loans',
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Could not request loan';
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
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
                        loading="lazy"
                        decoding="async"
                        onError={() => setCoverImage(FALLBACK_COVER)}
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
                    <p className={`availability-status ${isRented ? 'not-available' : 'available'}`}>
                        {isRented ? 'Not Availability' : 'Availability'}
                    </p>
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
                    className={`rent-button ${isRented ? 'is-rented' : ''}`}
                    onClick={handleRent}
                    disabled={isRenting || isRented}
                >
                    <span className="material-symbols-outlined">
                        {isRented ? 'check_circle' : 'hand_package'}
                    </span>
                    {isRenting ? 'Requesting...' : isRented ? 'Rented' : 'Rent'}
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