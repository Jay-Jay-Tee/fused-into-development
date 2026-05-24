import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const expandSearchQuery = async (query) => {
  const response = await axios.post(
    `${API_URL}/ai/search`,
    { query }
  );

  return response.data.data;
};