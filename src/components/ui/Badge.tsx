import React from 'react';
import './Badge.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'promo' | 'success' | 'tag-yellow' | 'tag-purple' | 'tag-coral' | 'discount';
}

/**
 * Badge Component
 * Digunakan untuk indikator status (contoh: Lunas = success, DP = tag-yellow)
 */
export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'tag-yellow',
  className = '',
  ...props 
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
};
