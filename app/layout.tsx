import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rambo — AI Resume Builder | Build an ATS-Ready Resume in Minutes',
  description:
    'Build an interview-winning resume in minutes with AI-powered editing, 18 ATS-optimized templates, and design matching. Free, private, no signup required.',
  keywords: 'resume builder, ATS resume, AI resume, free resume maker, ATS-friendly, resume templates',
  openGraph: {
    title: 'Rambo — AI Resume Builder',
    description: 'Build an interview-winning resume in minutes with AI assistance. Free, private, no signup.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
