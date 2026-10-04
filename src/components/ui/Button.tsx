import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'yellow' | 'blue' | 'secondary' | 'ghost' | 'icon';
  size?: 'md' | 'sm';
}

/**
 * Button Component
 * Reusable button yang mengikuti panduan bentuk 'pill' (rounded-full) dari Miro Design.
 * - variant='primary': Warna dominan hitam (action utama).
 * - variant='yellow': Aksen brand kuning.
 * - variant='secondary': Garis luar (outline) untuk aksi opsional.
 */
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-size-${size}`;
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
