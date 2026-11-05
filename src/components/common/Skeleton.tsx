import React from 'react';

interface SkeletonProps {
  type?: 'text' | 'card' | 'table-row';
  count?: number;
  height?: number | string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  count = 1,
  height = '1.25rem'
}) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="row g-4">
        {items.map((_, i) => (
          <div key={i} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden placeholder-glow">
              <div className="placeholder bg-secondary bg-opacity-25" style={{ height: '220px', width: '100%' }} />
              <div className="card-body p-4">
                <span className="placeholder col-4 mb-2 bg-secondary bg-opacity-25 rounded" />
                <h5 className="placeholder col-8 bg-secondary bg-opacity-25 rounded mb-3" />
                <p className="placeholder col-12 bg-secondary bg-opacity-25 rounded" />
                <p className="placeholder col-7 bg-secondary bg-opacity-25 rounded mb-4" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="placeholder col-3 bg-secondary bg-opacity-25 rounded" />
                  <span className="placeholder col-4 bg-primary bg-opacity-25 rounded py-2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table-row') {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className="placeholder-glow">
            <td colSpan={10} className="py-3">
              <span className="placeholder col-12 bg-secondary bg-opacity-10 py-3 rounded" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <div className="placeholder-glow">
      {items.map((_, i) => (
        <span
          key={i}
          className="placeholder col-12 bg-secondary bg-opacity-25 rounded mb-2 d-block"
          style={{ height }}
        />
      ))}
    </div>
  );
};
