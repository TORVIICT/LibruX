import { createContext, useContext, useState } from "react";

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

    return (
        <SearchContext.Provider value={{ search, setSearch }}>
            {children}
        </SearchContext.Provider>
    );
}