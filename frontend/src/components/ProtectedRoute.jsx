import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePath, useNavigate } from '../context/RouterContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const path = usePath();
  const navigate = useNavigate();

  if (loading) return <div className="text-center text-cyan-400 py-10">Chargement...</div>;
  
  // Si l'utilisateur n'est pas connecté, on le redirige vers login
  if (!user && path !== '/login' && path !== '/register/player' && path !== '/register/coach') {
    navigate('/login');
    return null;
  }

  return children;
};
export default ProtectedRoute;