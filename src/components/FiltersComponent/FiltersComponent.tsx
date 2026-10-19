import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import './FiltersComponent.scss';
import type { BookFiltersState, AvailabilityFilter } from '../../utils/filterBooks';

export const THEMATIC_CATEGORIES = [
  'fantasy',
  'technology',
  'science',
  'education',
  'business',
  'health',
  'history',
  'art',
  'music',
  'sports',
];

const LANGUAGE_CATEGORIES = [
  'spanish',
  'english',
  'french',
  'german',
  'italian',
];

export interface FiltersComponentProps {
  filters: BookFiltersState;
  activeFilterCount?: number;
  onToggleCategory: (category: string) => void;
  onSetAvailability: (availability: AvailabilityFilter) => void;
  onSetRating: (rating: number) => void;
  onToggleLanguage: (language: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FiltersComponent({
  filters,
  activeFilterCount = 0,
  onToggleCategory,
  onSetAvailability,
  onSetRating,
  onToggleLanguage,
  onApply,
  onReset,
}: FiltersComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleOpen();
    }
  };

  const handleStarKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    starValue: number
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSetRating(starValue);
    }
  };

  return (
    <aside
      className={`panel-filters ${isOpen ? 'is-open' : ''}`}
      aria-label="Book Catalog Filters"
    >
      <div
        className="title"
        onClick={handleToggleOpen}
        onKeyDown={handleHeaderKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label="Toggle filters"
      >
        <span className="material-symbols-outlined icon-badge">tune</span>
        <h2>Filters</h2>
        {activeFilterCount > 0 && (
          <span className="active-count-badge">
            {activeFilterCount}
          </span>
        )}
        <span className="material-symbols-outlined toggle-icon">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>

      <div className="thematic-category">
        <h3>Thematic Category</h3>
        <ul className="categories">
          {THEMATIC_CATEGORIES.map((category) => {
            const isChecked = filters.categories.includes(category);
            return (
              <li key={category}>
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  name={category}
                  checked={isChecked}
                  onChange={() => onToggleCategory(category)}
                />
                <label htmlFor={`category-${category}`}>{category}</label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="availability-category">
        <h3>Availability</h3>
        <ul className="categories">
          <li>
            <input
              type="checkbox"
              id="availability-available"
              name="available"
              checked={filters.availability === 'available'}
              onChange={() =>
                onSetAvailability(
                  filters.availability === 'available' ? 'all' : 'available'
                )
              }
            />
            <label htmlFor="availability-available">Available</label>
          </li>
          <li>
            <input
              type="checkbox"
              id="availability-not-available"
              name="not-available"
              checked={filters.availability === 'not-available'}
              onChange={() =>
                onSetAvailability(
                  filters.availability === 'not-available'
                    ? 'all'
                    : 'not-available'
                )
              }
            />
            <label htmlFor="availability-not-available">Not Available</label>
          </li>
        </ul>
      </div>

      <div className="qualification-category">
        <h3>Rating</h3>
        <ul className="categories stars-rating" aria-label="Filter by minimum star rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const isHighlighted = (hoveredRating || filters.minRating) >= star;
            const isSelected = filters.minRating === star;
            return (
              <li
                key={star}
                className={`star-item ${isHighlighted ? 'active' : ''} ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => onSetRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onKeyDown={(e) => handleStarKeyDown(e, star)}
                role="button"
                tabIndex={0}
                aria-label={`${star} star minimum rating`}
              >
                <span className="material-symbols-outlined star-icon">star</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="language-category">
        <h3>Language</h3>
        <ul className="categories">
          {LANGUAGE_CATEGORIES.map((language) => {
            const isChecked = filters.languages.includes(language);
            return (
              <li key={language}>
                <input
                  type="checkbox"
                  id={`language-${language}`}
                  name={language}
                  checked={isChecked}
                  onChange={() => onToggleLanguage(language)}
                />
                <label htmlFor={`language-${language}`}>{language}</label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="filter-actions">
        <button
          type="button"
          className="btn-apply-filters"
          onClick={onApply}
        >
          Apply Filters
        </button>
        <button
          type="button"
          className="btn-reset-filters"
          onClick={onReset}
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
}