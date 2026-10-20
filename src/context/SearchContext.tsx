import { createContext, useContext, useState, useMemo } from "react";

interface SearchContextType {
    search: string;
    setSearch: (search: string) => void;
}

export const SearchContext = createContext<SearchContextType | null>(null);

export const useSearchContext = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearchContext debe usarse dentro de un SearchContextProvider");
    }
    return context;
}

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [search, setSearch] = useState("");

    const contextValue = useMemo(() => ({
        search,
        setSearch,
    }), [search]);

    return (
        <SearchContext.Provider value={contextValue}>
            {children}
        </SearchContext.Provider>
    );
}