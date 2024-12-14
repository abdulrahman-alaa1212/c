import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Toast = ({ message, type = 'info', onClose }) => {
  const types = {
    success: {
      icon: '✓',
      className: 'bg-green-500',
    },
    error: {
      icon: '✕',
      className: 'bg-red-500',
    },
    warning: {
      icon: '⚠',
      className: 'bg-yellow-500',
    },
    info: {
      icon: 'ℹ',
      className: 'bg-blue-500',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`${types[type].className} text-white p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
    >
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <span className="text-lg">{types[type].icon}</span>
        <p className="font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </motion.div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func.isRequired,
};

export default Toast;
