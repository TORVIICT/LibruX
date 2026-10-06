import "./CardBook.scss";

export interface CardBookProps {
    id: number | string;
    cover_i: number;
    title: string;
    author_name: string[];
    subject: string[];
    language: string;
}

export function CardBook({id, cover_i, title, author_name, subject, language}: CardBookProps) {
    const coverImage = `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`;
    const formattedAuthor = Array.isArray(author_name) ? author_name.slice(0, 2).join(", ") : (author_name || "Unknown Author");
    const formattedSubject = Array.isArray(subject) ? subject.slice(0, 3).join(", ") : (subject || "General");

    return (
        <section className="cardBook">

            <div className="cardBook-info">

                <div className="img-container">
                    <img 
                        src={coverImage} 
                        alt={title} 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80";
                        }}
                    />
                    <span className="material-symbols-outlined">bookmark</span>
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
                </div>

            </div>

            <div className="cardBook-actions">
                <button className="rent-button">
                    <span className="material-symbols-outlined">hand_package</span>Rent
                </button>
                <button className="view-button">
                    <span className="material-symbols-outlined">info</span>View more
                </button>
            </div>
            
        </section>
    );
}