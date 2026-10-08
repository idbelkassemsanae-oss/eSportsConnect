import api from './api';

// Récupérer toutes les conversations de l'utilisateur
export const getConversations = () => {
  return api.get('/communication/conversations/');
};

// Récupérer une conversation avec ses messages
export const getConversation = (id) => {
  return api.get(`/communication/conversations/${id}/`);
};

// Envoyer un message dans une conversation
export const sendMessage = (conversationId, messageData) => {
  return api.post(`/communication/conversations/${conversationId}/messages/`, messageData);
};

// Créer une nouvelle conversation (privée ou de groupe)
export const createConversation = (participantIds, isGroup = false, name = '') => {
  return api.post('/communication/conversations/', {
    participants: participantIds,
    is_group: isGroup,
    name: name
  });
};

// Marquer tous les messages comme lus
export const markAsRead = (conversationId) => {
  return api.post(`/communication/conversations/${conversationId}/mark-read/`);
};