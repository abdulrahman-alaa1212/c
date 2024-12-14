import React from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';

const Navbar = () => {
  const { toggleTheme, theme, language, setLanguage } = usePreferences();

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              المحفظة الشخصية
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-select bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
