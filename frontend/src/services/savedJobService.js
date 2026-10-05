import api from './api';

export const savedJobService = {
  list: (params) => api.get('/saved-jobs', { params }),
  save: (jobId) => api.post(`/saved-jobs/${jobId}`),
  remove: (jobId) => api.delete(`/saved-jobs/${jobId}`),
};
