import api from './api';

// Récupérer la liste des cours (tous)
export const getCourses = (params = {}) => {
  return api.get('/coaching/api/courses/', { params });
};

// Récupérer un cours spécifique
export const getCourse = (id) => {
  return api.get(`/coaching/api/courses/${id}/`);
};

// S'inscrire à un cours
export const enrollCourse = (id) => {
  return api.post(`/coaching/api/courses/${id}/enroll/`);
};

// Se désinscrire d'un cours
export const unenrollCourse = (id) => {
  return api.post(`/coaching/api/courses/${id}/unenroll/`);
};

// Créer un cours (coach)
export const createCourse = (data) => {
  return api.post('/coaching/api/courses/create/', data);
};

// Modifier un cours (coach)
export const updateCourse = (id, data) => {
  return api.put(`/coaching/api/courses/${id}/update/`, data);
};

// Supprimer un cours (coach)
export const deleteCourse = (id) => {
  return api.delete(`/coaching/api/courses/${id}/delete/`);
};

// Récupérer les ressources d'un cours
export const getCourseResources = (courseId) => {
  return api.get(`/coaching/api/courses/${courseId}/resources/`);
};

// Ajouter une ressource
export const addCourseResource = (courseId, data) => {
  return api.post(`/coaching/api/courses/${courseId}/resources/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Supprimer une ressource
export const deleteCourseResource = (courseId, resourceId) => {
  return api.delete(`/coaching/api/courses/${courseId}/resources/${resourceId}/`);
};

// Récupérer les commentaires
export const getCourseComments = (courseId) => {
  return api.get(`/coaching/api/courses/${courseId}/comments/`);
};

// Ajouter un commentaire
export const addCourseComment = (courseId, data) => {
  return api.post(`/coaching/api/courses/${courseId}/comments/`, data);
};

// Récupérer les sessions live
export const getLiveSessions = (courseId) => {
  return api.get(`/coaching/api/courses/${courseId}/live-sessions/`);
};

// Créer une session live
export const createLiveSession = (courseId, data) => {
  return api.post(`/coaching/api/courses/${courseId}/live-sessions/`, data);
};