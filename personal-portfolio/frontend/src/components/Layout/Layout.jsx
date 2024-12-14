import React from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const { theme, direction } = usePreferences();

  return (
    <div className={`min-h-screen bg-bg-primary ${theme} ${direction}`}>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
