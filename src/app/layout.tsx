import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'SaaSReels | AI Short-Form Video Studio for Software & Tech',
  description: 'Turn any SaaS or product URL into viral TikToks, Instagram Reels, and YouTube Shorts with Blitz Mode swipe approval.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-400 selection:text-black">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
