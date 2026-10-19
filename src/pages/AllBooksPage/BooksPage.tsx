import { FiltersComponent } from '../../components/FiltersComponent/FiltersComponent';
import { BookList } from '../../components/BookList/BookList';
import { useBookFilters } from '../../hooks/useBookFilters';
import './BooksPage.scss';

export default function BooksPage() {
  const {
    draftFilters,
    appliedFilters,
    activeFilterCount,
    toggleCategory,
    setAvailability,
    setRating,
    toggleLanguage,
    applyFilters,
    resetFilters,
  } = useBookFilters();

  return (
    <div className="container-books-page">
      <FiltersComponent
        filters={draftFilters}
        activeFilterCount={activeFilterCount}
        onToggleCategory={toggleCategory}
        onSetAvailability={setAvailability}
        onSetRating={setRating}
        onToggleLanguage={toggleLanguage}
        onApply={applyFilters}
        onReset={resetFilters}
      />
      <BookList
        filters={appliedFilters}
        onResetFilters={resetFilters}
      />
    </div>
  );
}