import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'text' | 'search';
}

/**
 * Input Component
 * Form field sesuai standar Miro:
 * - variant='text': Box standar (border kuat, radius sedang)
 * - variant='search': Pil pencarian abu-abu
 */
export const Input: React.FC<InputProps> = ({ 
  variant = 'text',
  className = '',
  ...props 
}) => {
  const baseClass = 'input';
  const variantClass = `input-${variant}`;
  
  return (
    <input 
      className={`${baseClass} ${variantClass} ${className}`} 
      {...props} 
    />
  );
};
