import api from './api';

export const userService = {
  dashboard: () => api.get('/users/dashboard'),
  updateProfile: (payload) => api.put('/users/profile', payload),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/users/profile-image', formData);
  },
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/users/resumes', formData);
  },
  replaceResume: (id, file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.put(`/users/resumes/${id}`, formData);
  },
  setDefaultResume: (id) => api.patch(`/users/resumes/${id}/default`),
  deleteResume: (id) => api.delete(`/users/resumes/${id}`),
};
