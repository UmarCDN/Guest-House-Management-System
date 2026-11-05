import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="breadcrumb mb-1 small">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return isLast ? (
            <li key={index} className="breadcrumb-item active text-muted" aria-current="page">
              {item.label}
            </li>
          ) : (
            <li key={index} className="breadcrumb-item">
              {item.link ? (
                <Link to={item.link} className="text-decoration-none text-secondary">
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
