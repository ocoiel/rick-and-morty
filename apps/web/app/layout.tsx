import { Geist, Space_Grotesk } from 'next/font/google';
import { Providers } from '@/components/providers';

import type { Metadata, Viewport } from 'next';

import './globals.css';

const sans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: {
    default: 'Elenco por Episódio · Rick and Morty',
    template: '%s · Rick and Morty',
  },
  description:
    'Consulte o elenco de qualquer episódio de Rick and Morty em ordem alfabética, com navegação instantânea.',
  openGraph: {
    type: 'website',
    siteName: 'Elenco por Episódio',
  },
};

export const viewport: Viewport = {
  themeColor: '#07090c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-portal focus:px-4 focus:py-2 focus:font-medium focus:text-void"
        >
          Pular para o conteúdo
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
