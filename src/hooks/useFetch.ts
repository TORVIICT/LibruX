import {useEffect, useState} from "react";

export function useFetch (url: string) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(url);
                const data = await response.json();
                setData(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [url]);
    
    return { data, loading, error };
}