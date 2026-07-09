'use client';

import { Theme } from '@astryxdesign/core/theme';
import { LinkProvider } from '@astryxdesign/core/Link';
import { designTheme } from '@/lib/design-theme';
import Link from 'next/link';

export default function AstryxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={designTheme}>
      <LinkProvider component={Link}>
        {children}
      </LinkProvider>
    </Theme>
  );
}
