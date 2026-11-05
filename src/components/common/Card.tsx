import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  footer,
  children,
  className = '',
  bodyClassName = '',
  noPadding = false
}) => {
  return (
    <div className={`card border-0 shadow-sm rounded-3 overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className="card-header bg-white border-bottom border-light py-3 px-4 d-flex align-items-center justify-content-between">
          <div>
            {typeof title === 'string' ? (
              <h6 className="card-title fw-bold mb-0 text-dark">{title}</h6>
            ) : (
              title
            )}
            {subtitle && <small className="text-muted d-block mt-0.5">{subtitle}</small>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'p-0' : 'p-4'} ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="card-footer bg-light border-top border-light py-3 px-4">
          {footer}
        </div>
      )}
    </div>
  );
};
