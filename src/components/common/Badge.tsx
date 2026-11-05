import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  pill?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  pill = true,
  className = ''
}) => {
  const pillClass = pill ? 'rounded-pill' : 'rounded-1';
  return (
    <span className={`badge bg-${variant} ${pillClass} px-2.5 py-1.5 fw-medium text-capitalize ${className}`}>
      {children}
    </span>
  );
};
