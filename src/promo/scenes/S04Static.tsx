import type { FC } from 'react';
import { ConnectionDesktop } from '../ui/tolink/ConnectionDesktop';
import { StaticToastStack } from '../ui/tolink/ConnectionPanel';
import { PROXY_TOASTS } from '../ui/tolink/data';
import { Stage } from '../ui/tolink/Stage';

export const S04Static: FC = () => (
  <Stage>
    <ConnectionDesktop toastLayer={<StaticToastStack toasts={PROXY_TOASTS} />} />
  </Stage>
);
