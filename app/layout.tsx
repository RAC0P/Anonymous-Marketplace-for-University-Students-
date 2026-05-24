import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampusXchange — Anonymous Uni Marketplace',
  description: 'Buy, sell and exchange within your campus — completely anonymous.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}