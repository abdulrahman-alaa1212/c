import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import Skills from './pages/Skills/Skills';
import { usePreferences } from './contexts/PreferencesContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const { theme } = usePreferences();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className={`${theme}`}>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/skills" element={<Skills />} />
              {/* Add more routes here */}
            </Routes>
          </Layout>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
