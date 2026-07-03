import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Team Flow',
  description:
    'Snackable, mobile-first learning for our Git / trunk-based / AI-assisted workflow.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16150F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: 'Archivo, system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
