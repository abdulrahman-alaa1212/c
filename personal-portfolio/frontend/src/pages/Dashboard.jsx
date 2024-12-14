import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaProjectDiagram, FaCogs, FaMoneyBillWave } from 'react-icons/fa';

const DashboardCard = ({ title, icon: Icon, description, path, bgColor }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className={`${bgColor} p-6 rounded-lg shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105`}
      onClick={() => navigate(path)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <Icon className="text-white text-3xl" />
      </div>
      <p className="text-white/80">{description}</p>
    </div>
  );
};

const Dashboard = () => {
  const cards = [
    {
      title: 'السيرة الذاتية',
      icon: FaUserTie,
      description: 'شوف خبراتي ومهاراتي والشهادات بتاعتي',
      path: '/cv',
      bgColor: 'bg-blue-600'
    },
    {
      title: 'المشاريع',
      icon: FaProjectDiagram,
      description: 'تصفح أحدث المشاريع اللي شغال عليها',
      path: '/projects',
      bgColor: 'bg-green-600'
    },
    {
      title: 'الخدمات',
      icon: FaCogs,
      description: 'اعرف ايه الخدمات اللي بقدمها',
      path: '/services',
      bgColor: 'bg-purple-600'
    },
    {
      title: 'الأسعار',
      icon: FaMoneyBillWave,
      description: 'شوف الباقات والأسعار المتاحة',
      path: '/pricing',
      bgColor: 'bg-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          أهلاً بيك في لوحة التحكم
        </h1>
        <p className="text-xl text-gray-600">
          اختار من الأقسام دي عشان تعرف المزيد
        </p>
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900">15</h4>
              <p className="text-gray-600">مشروع مكتمل</p>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900">5</h4>
              <p className="text-gray-600">خدمات متاحة</p>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900">100%</h4>
              <p className="text-gray-600">رضا العملاء</p>
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900">24/7</h4>
              <p className="text-gray-600">دعم فني</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
