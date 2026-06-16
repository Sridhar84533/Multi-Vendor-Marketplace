import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating, size = 16, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;
  const fullStars = Math.floor(displayRating);
  const hasHalf = !onChange && (displayRating % 1 >= 0.5);

  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', color: '#F3A847', cursor: onChange ? 'pointer' : 'default' }}
      onMouseLeave={() => onChange && setHoverRating(0)}
    >
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        if (starValue <= fullStars) {
          return (
            <Star 
              key={i} 
              size={size} 
              fill="#F3A847" 
              onClick={() => onChange && onChange(starValue)}
              onMouseEnter={() => onChange && setHoverRating(starValue)} 
            />
          );
        } else if (hasHalf && starValue === fullStars + 1) {
          return <StarHalf key={i} size={size} fill="#F3A847" />;
        } else {
          return (
            <Star 
              key={i} 
              size={size} 
              onClick={() => onChange && onChange(starValue)}
              onMouseEnter={() => onChange && setHoverRating(starValue)} 
            />
          );
        }
      })}
    </div>
  );
};

export default StarRating;
