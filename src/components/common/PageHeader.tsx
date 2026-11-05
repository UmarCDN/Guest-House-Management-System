import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-2" />}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1 h3">{title}</h2>
          {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
        </div>
        {action && <div className="d-flex align-items-center gap-2">{action}</div>}
      </div>
    </div>
  );
};
