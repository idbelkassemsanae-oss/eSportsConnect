import axios from 'axios';

// Création de l'instance Axios avec l'URL de base de ton backend
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Base URL de ton backend Django
});

// ✅ Intercepteur de REQUÊTE : Ajoute le token à chaque requête
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepteur de RÉPONSE : Gère le rafraîchissement automatique du token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si on reçoit un 401 et que la requête n'est pas déjà une tentative de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Appel à l'endpoint de rafraîchissement de token
          const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken,
          });

          // Mise à jour du token d'accès dans le localStorage
          localStorage.setItem('access_token', res.data.access);

          // On met à jour le header de la requête d'origine et on la réessaie
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return API(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue, on nettoie le storage et on redirige vers login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token disponible, on déconnecte
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;