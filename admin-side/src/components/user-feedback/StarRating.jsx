import { Star } from 'lucide-react';

export default function StarRating({ value = 0, size = 16 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }
        />
      ))}
    </div>
  );
}
