import api from './api';

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  employers: (params) => api.get('/admin/employers', { params }),
  setEmployerStatus: (id, payload) => api.patch(`/admin/employers/${id}/verify`, payload),
  companies: (params) => api.get('/admin/companies', { params }),
  jobs: (params) => api.get('/admin/jobs', { params }),
  approveJob: (id) => api.patch(`/admin/jobs/${id}/approve`),
  rejectJob: (id, payload) => api.patch(`/admin/jobs/${id}/reject`, payload),
  applications: (params) => api.get('/admin/applications', { params }),
  reports: (params) => api.get('/admin/reports', { params }),
  updateReport: (id, payload) => api.patch(`/admin/reports/${id}`, payload),
  messages: (params) => api.get('/admin/messages', { params }),
  updateMessage: (id, payload) => api.patch(`/admin/messages/${id}`, payload),
  broadcast: (payload) => api.post('/admin/notifications', payload),
  broadcasts: (params) => api.get('/admin/notifications', { params }),
  settings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.put('/admin/settings', payload),
  auditLogs: (params) => api.get('/admin/audit-logs', { params }),
};
