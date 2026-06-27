'use client';

import { COLORS } from '@/lib/types';

interface Props {
  selected: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ selected, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {COLORS.map(c => (
        <button
          key={c.hex}
          onClick={() => onChange(c.hex)}
          title={c.name}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: c.hex,
            cursor: 'pointer',
            flexShrink: 0,
            outline: selected === c.hex ? `3px solid white` : '3px solid transparent',
            outlineOffset: 2,
            transform: selected === c.hex ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.1s',
            boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  );
}
