// Path.ts - API configuration for frontend

const isDevelopment = window.location.hostname === 'localhost';
// Use localhost backend during development. In production, use a relative
// `/api` path so the frontend sends requests to the same host where it's served.
const API_BASE_URL = isDevelopment ? 'http://localhost:5000/api' : '/api';

export const buildPath = (route: string): string => {
  return `${API_BASE_URL}/${route}`;
};