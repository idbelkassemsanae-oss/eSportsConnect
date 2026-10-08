import React, { createContext, useState, useContext } from 'react';

export const ThemeContext = createContext();

// ✅ CRÉATION DU HOOK MANQUANT
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <div style={{ background: darkMode ? '#121212' : '#f0f0f0', color: darkMode ? '#fff' : '#000', minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};