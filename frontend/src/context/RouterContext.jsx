import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext();

const getPath = () => {
  let path = window.location.pathname;
  if (path.startsWith('/')) path = path.slice(1);
  return path;
};

export const RouterProvider = ({ children }) => {
  const [page, setPage] = useState(getPath());

  const navigate = (newPage) => {
    setPage(newPage);
    window.history.pushState({}, '', '/' + newPage);
  };

  useEffect(() => {
    const handlePopState = () => setPage(getPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ page, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('usePage must be used within a RouterProvider');
  return context.page;
};

export const useNavigate = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useNavigate must be used within a RouterProvider');
  return context.navigate;
};