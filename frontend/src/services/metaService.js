import api from './api';

// Categories and locations are public to read; admin pages also use the write endpoints.
export const metaService = {
  categories: (params) => api.get('/categories', { params }),
  createCategory: (payload) => api.post('/categories', payload),
  updateCategory: (id, payload) => api.put(`/categories/${id}`, payload),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  locations: (params) => api.get('/locations', { params }),
  createLocation: (payload) => api.post('/locations', payload),
  updateLocation: (id, payload) => api.put(`/locations/${id}`, payload),
  deleteLocation: (id) => api.delete(`/locations/${id}`),
};
