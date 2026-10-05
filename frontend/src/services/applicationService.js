import api from './api';

export const applicationService = {
  apply: (payload) => api.post('/applications', payload),
  mine: (params) => api.get('/applications/my', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, payload) => api.patch(`/applications/${id}/status`, payload),
  withdraw: (id) => api.patch(`/applications/${id}/withdraw`),
  // Employer endpoints
  forJob: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  forEmployer: (params) => api.get('/applications/employer', { params }),
};
