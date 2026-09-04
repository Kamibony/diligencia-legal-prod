import axios from 'axios';

// Base API instance targeting the Cloud Run backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://legal-backend-772449854489.southamerica-east1.run.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// We could add interceptors here later to inject auth tokens
