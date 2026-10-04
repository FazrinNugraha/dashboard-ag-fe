import React from 'react';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'feature' | 'stat' | 'yellow' | 'teal' | 'coral' | 'rose';
  hoverEffect?: boolean;
}

/**
 * Card Component
 * Wadah konten. 
 * - variant='base': Kartu putih biasa dengan border halus (contoh: untuk tabel/form)
 * - variant='stat': Transparan, huruf besar untuk metrik (contoh: total omzet)
 * - variant='feature'/'yellow'/dll: Kotak dengan radius besar (28px) untuk highlight fitur.
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'base',
  hoverEffect = false,
  className = '',
  ...props 
}) => {
  const baseClass = 'card';
  const variantClass = `card-${variant}`;
  const hoverClass = hoverEffect ? 'card-hover' : '';
  
  return (
    <div className={`${baseClass} ${variantClass} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
