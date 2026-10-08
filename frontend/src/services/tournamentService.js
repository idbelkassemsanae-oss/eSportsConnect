import API from './api';

// ✅ EXPORTATIONS INDIVIDUELLES POUR CORRESPONDRE À TES IMPORTS
export const getTournaments = () => API.get('/tournaments/list/');
export const getTournamentById = (id) => API.get(`/tournaments/${id}/`);
export const createTournament = (data) => API.post('/tournaments/create/', data);
export const updateTournament = (id, data) => API.put(`/tournaments/${id}/`, data);
export const deleteTournament = (id) => API.delete(`/tournaments/${id}/`);
export const registerForTournament = (id) => API.post(`/tournaments/register/${id}/`);