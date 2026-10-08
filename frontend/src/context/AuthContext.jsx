import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const role = localStorage.getItem('role') || 'player';
      const username = localStorage.getItem('username') || 'Joueur';
      setUser({ username, role });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', username);
      
      const profileRes = await axios.get('http://127.0.0.1:8000/api/accounts/profile/', {
        headers: { Authorization: `Bearer ${res.data.access}` }
      });
      const role = profileRes.data.role || 'player';
      localStorage.setItem('role', role);
      setUser({ username, role });
      return { success: true };
    } catch (error) {
      return { success: false, message: "Erreur de connexion" };
    }
  };

  // ✅ Fonction register bien définie et exposée
  const register = async (userData) => {
    const endpoint = userData.role === 'coach' ? '/api/accounts/register/coach/' : '/api/accounts/register/player/';
    const baseURL = 'http://127.0.0.1:8000';

    try {
      const dataToSend = { ...userData };
      if (Array.isArray(dataToSend.availability)) {
        dataToSend.availability = dataToSend.availability.join(', ');
      }

      const hasAvatar = userData.avatar instanceof File;

      if (userData.role === 'coach' || hasAvatar) {
        const formData = new FormData();
        for (const key in dataToSend) {
          if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
            formData.append(key, dataToSend[key]);
          }
        }
        if (hasAvatar) formData.append('avatar', userData.avatar);
        await axios.post(baseURL + endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(baseURL + endpoint, dataToSend);
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: "Erreur lors de l'inscription" };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  // ✅ On expose bien user, loading, login, register, logout
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};