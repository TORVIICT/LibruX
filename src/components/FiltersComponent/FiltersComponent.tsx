import { useState } from "react";
import "./FiltersComponent.scss";

export function FiltersComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);

    return (
        <section className={`panel-filters ${isOpen ? "is-open" : ""}`}>

            <div className="title" onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0}>
                <span className="material-symbols-outlined">
                    tune
                </span>
                <h2>Filters</h2>
                <span className="material-symbols-outlined toggle-icon">
                    {isOpen ? "expand_less" : "expand_more"}
                </span>
            </div>

            <div className="tematic-category">
                <h3>TEMATIC CATEGORY</h3>
                <ul className="categories">
                    <li><input type="checkbox" name="technology" id="technology" /><label htmlFor="technology">technology</label></li>
                    <li><input type="checkbox" name="education" id="education" /><label htmlFor="education">education</label></li>
                    <li><input type="checkbox" name="business" id="business" /><label htmlFor="business">business</label></li>
                    <li><input type="checkbox" name="health" id="health" /><label htmlFor="health">health</label></li>
                    <li><input type="checkbox" name="science" id="science" /><label htmlFor="science">science</label></li>
                    <li><input type="checkbox" name="sports" id="sports" /><label htmlFor="sports">sports</label></li>
                    <li><input type="checkbox" name="music" id="music" /><label htmlFor="music">music</label></li>
                </ul>
            </div>

            <div className="availability-category">
                <h3>AVAILABILITY CATEGORY</h3>
                <ul className="categories">
                    <li><input type="checkbox" name="available" id="available" /><label htmlFor="available">available</label></li>
                    <li><input type="checkbox" name="not-available" id="not-available" /><label htmlFor="not-available">not available</label></li>
                </ul>
            </div>

            <div className="qualification-category">
                <h3>QUALIFICATION CATEGORY</h3>
                <ul className="categories stars-rating">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const isHighlighted = (hoveredRating || selectedRating) >= star;
                        const isSelected = selectedRating === star;
                        return (
                            <li
                                key={star}
                                className={`star-item ${isHighlighted ? "active" : ""} ${isSelected ? "selected" : ""}`}
                                onClick={() => setSelectedRating(selectedRating === star ? 0 : star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                role="button"
                                tabIndex={0}
                            >
                                <span className="material-symbols-outlined star-icon">
                                    star
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="lenguage-category">
                <h3>LANGUAGE CATEGORY</h3>
                <ul className="categories">
                    <li><input type="checkbox" name="spanish" id="spanish" /><label htmlFor="spanish">spanish</label></li>
                    <li><input type="checkbox" name="english" id="english" /><label htmlFor="english">english</label></li>
                    <li><input type="checkbox" name="french" id="french" /><label htmlFor="french">french</label></li>
                    <li><input type="checkbox" name="german" id="german" /><label htmlFor="german">german</label></li>
                    <li><input type="checkbox" name="italian" id="italian" /><label htmlFor="italian">italian</label></li>
                </ul>
            </div>

            <button>APPLY FILTERS</button>

        </section>
    );
}