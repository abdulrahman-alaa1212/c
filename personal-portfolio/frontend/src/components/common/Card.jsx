import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  variant = 'default',
  hover = false,
  className = '',
}) => {
  const baseStyles = 'rounded-lg overflow-hidden';
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outline: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  };

  const hoverStyles = hover ? 'transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg' : '';

  const classes = [
    baseStyles,
    variants[variant],
    hoverStyles,
    className,
  ].join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'outline']),
  hover: PropTypes.bool,
  className: PropTypes.string,
};

export default Card;
