// Path.ts - API configuration for frontend

// Use relative URLs so API calls go to the same domain as the frontend
const API_BASE_URL = '/api';

export const buildPath = (route: string): string => {
  return `${API_BASE_URL}/${route}`;
};