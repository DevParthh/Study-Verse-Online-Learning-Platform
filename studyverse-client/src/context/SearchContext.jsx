/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchConfig, setSearchConfig] = useState({ isVisible: false });
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const executeSearch = async (searchQuery) => {
        if (!searchConfig.onSearch || !searchQuery.trim()) {
            // If there's no search function or query, clear results
            setResults(null); 
            return;
        }
        setIsLoading(true);
        try {
            const data = await searchConfig.onSearch(searchQuery);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
            setResults([]); // Set to empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        searchConfig,
        setSearchConfig,
        query,
        setQuery,
        results,
        setResults,
        isLoading,
        executeSearch,
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    return useContext(SearchContext);
};