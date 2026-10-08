// src/services/resourceService.js
import api from './api';

export const getResources = (params = {}) => {
  return api.get('/resources/api/', { params });
};

export const getResource = (id) => {
  return api.get(`/resources/api/${id}/`);
};

export const createResource = (data) => {
  return api.post('/resources/api/create/', data);
};

export const updateResource = (id, data) => {
  return api.put(`/resources/api/${id}/`, data);
};

export const deleteResource = (id) => {
  return api.delete(`/resources/api/${id}/`);
};

export const likeResource = (id) => {
  return api.post(`/resources/api/${id}/like/`);
};

export const viewResource = (id) => {
  return api.post(`/resources/api/${id}/view/`);
};