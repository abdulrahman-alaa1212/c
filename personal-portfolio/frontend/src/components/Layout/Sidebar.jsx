import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'لوحة التحكم', icon: '📊' },
    { path: '/projects', label: 'المشاريع', icon: '💼' },
    { path: '/skills', label: 'المهارات', icon: '🎯' },
    { path: '/blog', label: 'المدونة', icon: '📝' },
    { path: '/contact', label: 'اتصل بي', icon: '📧' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm h-screen">
      <div className="p-4">
        <div className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
