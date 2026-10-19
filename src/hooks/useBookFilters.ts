import { useState, useCallback, useMemo } from 'react';
import {
  INITIAL_FILTERS,
  type BookFiltersState,
  type AvailabilityFilter,
} from '../utils/filterBooks';

export function useBookFilters(initialState: BookFiltersState = INITIAL_FILTERS) {
  const [draftFilters, setDraftFilters] = useState<BookFiltersState>(initialState);
  const [appliedFilters, setAppliedFilters] = useState<BookFiltersState>(initialState);

  const toggleCategory = useCallback((category: string) => {
    setDraftFilters((prev) => {
      const exists = prev.categories.includes(category);
      const nextCategories = exists
        ? prev.categories.filter((cat) => cat !== category)
        : [...prev.categories, category];
      return { ...prev, categories: nextCategories };
    });
  }, []);

  const setAvailability = useCallback((availability: AvailabilityFilter) => {
    setDraftFilters((prev) => ({ ...prev, availability }));
  }, []);

  const setRating = useCallback((minRating: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === minRating ? 0 : minRating,
    }));
  }, []);

  const toggleLanguage = useCallback((language: string) => {
    setDraftFilters((prev) => {
      const exists = prev.languages.includes(language);
      const nextLanguages = exists
        ? prev.languages.filter((lang) => lang !== language)
        : [...prev.languages, language];
      return { ...prev, languages: nextLanguages };
    });
  }, []);

  const applyFilters = useCallback(() => {
    setDraftFilters((currentDraft) => {
      setAppliedFilters({ ...currentDraft });
      return currentDraft;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setDraftFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = appliedFilters.categories.length + appliedFilters.languages.length;
    if (appliedFilters.availability !== 'all') {
      count += 1;
    }
    if (appliedFilters.minRating > 0) {
      count += 1;
    }
    return count;
  }, [appliedFilters]);

  return {
    draftFilters,
    appliedFilters,
    activeFilterCount,
    toggleCategory,
    setAvailability,
    setRating,
    toggleLanguage,
    applyFilters,
    resetFilters,
  };
}
