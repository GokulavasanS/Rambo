import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rambo — AI Resume Builder',
  description: 'Build an ATS-ready resume in minutes. AI-assisted editing, privacy-first, no accounts required.',
  keywords: 'resume builder, ATS, AI resume, free resume maker',
  openGraph: {
    title: 'Rambo — AI Resume Builder',
    description: 'Build an ATS-ready resume in minutes with AI assistance.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
