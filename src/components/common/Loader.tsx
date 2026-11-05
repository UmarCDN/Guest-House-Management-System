import React from 'react';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading...',
  size = 'md',
  fullPage = false
}) => {
  const spinnerSize = size === 'sm' ? '1.5rem' : size === 'lg' ? '3rem' : '2.25rem';

  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
      <div
        className="spinner-border text-primary mb-3"
        style={{ width: spinnerSize, height: spinnerSize }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="text-muted fw-medium small mb-0">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
        style={{ zIndex: 1070 }}
      >
        {content}
      </div>
    );
  }

  return content;
};
