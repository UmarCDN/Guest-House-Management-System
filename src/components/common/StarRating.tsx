import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewsCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  reviewsCount,
  interactive = false,
  onChange,
  className = ''
}) => {
  const stars = [];
  const fontSize = size === 'sm' ? '0.85rem' : size === 'lg' ? '1.25rem' : '1rem';

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);
    const isHalf = !isFilled && i <= Math.ceil(rating) && rating % 1 >= 0.3;

    stars.push(
      <i
        key={i}
        className={`bi ${isFilled ? 'bi-star-fill text-warning' : isHalf ? 'bi-star-half text-warning' : 'bi-star text-muted'} ${interactive ? 'cursor-pointer' : ''}`}
        style={{ fontSize, cursor: interactive ? 'pointer' : 'default' }}
        onClick={() => interactive && onChange && onChange(i)}
      />
    );
  }

  return (
    <div className={`d-inline-flex align-items-center gap-1 ${className}`}>
      <div className="d-flex align-items-center gap-0.5">{stars}</div>
      {showNumber && (
        <span className="fw-bold small text-dark ms-1">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewsCount !== undefined && (
        <span className="text-muted small ms-1">({reviewsCount})</span>
      )}
    </div>
  );
};
