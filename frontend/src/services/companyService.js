import api from './api';

export const companyService = {
  list: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  getMine: () => api.get('/companies/my'),
  dashboard: () => api.get('/companies/my/dashboard'),
  // Send FormData so logo and cover images can travel with the text fields.
  create: (formData) => api.post('/companies', formData),
  update: (id, formData) => api.put(`/companies/${id}`, formData),
};
