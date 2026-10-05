import api from './api';

// Small features that each have only a few endpoints: alerts, interviews, reports, contact, articles.
export const alertService = {
  list: () => api.get('/job-alerts'),
  create: (payload) => api.post('/job-alerts', payload),
  update: (id, payload) => api.put(`/job-alerts/${id}`, payload),
  remove: (id) => api.delete(`/job-alerts/${id}`),
};

export const interviewService = {
  mine: (params) => api.get('/interviews', { params }),
  schedule: (payload) => api.post('/interviews', payload),
  update: (id, payload) => api.put(`/interviews/${id}`, payload),
  cancel: (id) => api.delete(`/interviews/${id}`),
};

export const reportService = {
  create: (payload) => api.post('/reports', payload),
};

export const contactService = {
  send: (payload) => api.post('/contact', payload),
};

export const articleService = {
  list: (params) => api.get('/articles', { params }),
  getBySlug: (slug) => api.get(`/articles/${slug}`),
};
