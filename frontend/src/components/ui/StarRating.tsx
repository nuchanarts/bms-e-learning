import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({ value, onChange, readonly, size = 24 }: Props) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: size,
            cursor: readonly ? 'default' : 'pointer',
            color: star <= display ? '#F59E0B' : '#D1D5DB',
            transition: 'color 0.1s',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
