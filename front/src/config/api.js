export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getApiUrl = (endpoint) => {
    // Remove leading slash if present to avoid double slashes if base url has trailing slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    return `${cleanBase}${cleanEndpoint}`;
};
