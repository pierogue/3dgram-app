import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';

import '@telegram-apps/telegram-ui/dist/styles.css';
import 'normalize.css/normalize.css';
import './_assets/globals.css';
import { Header } from '@/components/Header/Header';

export const metadata: Metadata = {
  title: '3Dgram',
  description: '3Dgram is a social media platform that allows you to share your 3D models with your friends and family.',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
    <body>
      <I18nProvider>
        <Root>
          <Header/>
          {children}
        </Root>
      </I18nProvider>
    </body>
    </html>
  );
}
