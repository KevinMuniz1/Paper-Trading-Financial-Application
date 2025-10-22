// Path.ts - API configuration for frontend

const isDevelopment = window.location.hostname === 'localhost';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'http://paper-trade-app.com/api';

export const buildPath = (route: string): string => {
  return `${API_BASE_URL}/${route}`;
};