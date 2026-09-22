
const BASE_URL = import.meta.env.VITE_OPEN_LIBRARY_URL;

const options = {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
};

export async function searchBooks(query: string) {
    try {
        const response = await fetch(`${BASE_URL}/search.json?title=${query}`, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al buscar libros:', error);
        throw error;
    }
}

export async function getBookDetails(isbn: string) {
    try {
        const response = await fetch(`${BASE_URL}/ works / ${isbn}.json`, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener los detalles del libro:', error);
        throw error;
    }
}
