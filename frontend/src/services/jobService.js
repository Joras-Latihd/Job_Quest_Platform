import api from './api';

export const jobService = {
  list: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  related: (id) => api.get(`/jobs/${id}/related`),
  recommended: () => api.get('/jobs/recommended'),
  popularSearches: () => api.get('/jobs/popular-searches'),
  stats: () => api.get('/jobs/stats'),
  mine: (params) => api.get('/jobs/employer/mine', { params }),
  create: (payload) => api.post('/jobs', payload),
  update: (id, payload) => api.put(`/jobs/${id}`, payload),
  duplicate: (id) => api.post(`/jobs/${id}/duplicate`),
  updateStatus: (id, payload) => api.patch(`/jobs/${id}/status`, payload),
  feature: (id, payload) => api.patch(`/jobs/${id}/feature`, payload),
  remove: (id) => api.delete(`/jobs/${id}`),
};
