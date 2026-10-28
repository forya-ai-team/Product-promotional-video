import type { FC } from 'react';
import { CheckGlyph } from './glyphs';
import { tol } from './tokens';

type CheckboxProps = {
  checked?: boolean;
  size?: number;
  left: number;
  top: number;
};

export const Checkbox: FC<CheckboxProps> = ({ checked = true, size = 12, left, top }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: size,
      height: size,
      borderRadius: 2,
      background: checked ? tol.color.primary : '#FFFFFF',
      border: checked ? 'none' : `1px solid ${tol.color.buttonBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {checked ? <CheckGlyph size={size} /> : null}
  </div>
);
