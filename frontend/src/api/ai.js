import axios from 'axios';
import api from './axiosInstance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const expandSearchQuery = async (query) => {
  const response = await axios.post(
    `${API_URL}/ai/search`,
    { query }
  );
  return response.data.data;
};

export const getRecommendations = async (viewedProductIds = [], orderCategories = []) => {
  const response = await api.post('/ai/recommendations', { viewedProductIds, orderCategories });
  return response.data.data || [];
};