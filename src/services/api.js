const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiRequest = async (endpoint, options = {}) => {

    // מוודא שהאנדפוינט מתחיל בסלאש

    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    console.log('🎯 Attempting to fetch from:', url);

    const response = await fetch(url, options);

    if (!response.ok) {

        throw new Error(`API error: ${response.status}`);

    }

    return response.json();

};