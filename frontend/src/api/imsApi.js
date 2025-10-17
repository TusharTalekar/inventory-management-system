// src/api/imsApi.js
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

/**
 * Utility function to handle API calls
 * @param {string} endpoint - e.g., 'auth/login', 'products', 'admin/users'
 * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {object} body - Request body for POST/PUT
 * @param {string} token - JWT token for protected routes
 */
export const imsApi = async (endpoint, method = 'GET', body = null, token = null) => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    };

    try {
        const response = await fetch(url, config);

        // Handle 204 No Content for DELETE
        if (response.status === 204) return { success: true };

        // Parse JSON response
        const data = await response.json();

        if (!response.ok) {
            // Throw an error with the message from the backend
            throw new Error(data.message || `API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Call failed for ${endpoint}:`, error);
        throw error;
    }
};