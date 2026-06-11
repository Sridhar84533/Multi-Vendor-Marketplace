import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', color: '#F3A847' }}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} fill="#F3A847" />
      ))}
      {hasHalf && <StarHalf size={size} fill="#F3A847" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} />
      ))}
    </div>
  );
};

export default StarRating;
