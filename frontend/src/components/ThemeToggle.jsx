import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="fixed bottom-6 left-6 z-50 glass-card p-3 rounded-full border border-white/10 shadow-lg hover:scale-110 transition-all duration-200">
      {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-cyan-400 text-xl" />}
    </button>
  );
};
export default ThemeToggle;