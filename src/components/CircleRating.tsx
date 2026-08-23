import React from 'react';
import StarRating, { StarRatingProps } from './StarRating';

// Solid circles rather than stars: grey when empty, black when filled.
// `circle` was the Ionicons v4 name; the current set calls it `ellipse`.
const CircleRating = (props: StarRatingProps) => (
  <StarRating
    disabled={false}
    maxStars={3}
    fullStar={'ellipse'}
    emptyStar={'ellipse'}
    fullStarColor={'#000'}
    emptyStarColor={'#d8d8d8'}
    starStyle={{ fontSize: 32 }}
    containerStyle={{ padding: 8, height: 48 }}
    allowClear={true}
    {...props}
  />
);

export default CircleRating;
