import axios from 'axios';

const apiClient = axios.create({
  // eslint-disable-next-line no-undef
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;