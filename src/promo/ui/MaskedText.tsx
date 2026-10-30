import { Fragment } from 'react';
import type { FC } from 'react';

// Oumi is the downstream app named in the customer's Lark screenshots, not the
// product this film advertises, so the copy keeps its shape but the token has
// to read as redacted. Blur is em-relative so one constant tracks every type
// size from the 15.5px chat bubble to the 32px reading panel.
const TOKEN = /(Oumi)/gi;

type Props = { text: string; strength?: number };

export const MaskedText: FC<Props> = ({ text, strength = 0.26 }) => (
  <>
    {text.split(TOKEN).map((seg, i) =>
      i % 2 === 0 ? (
        <Fragment key={i}>{seg}</Fragment>
      ) : (
        <span key={i} style={{ display: 'inline-block', filter: `blur(${strength}em)` }}>
          {seg}
        </span>
      ),
    )}
  </>
);
