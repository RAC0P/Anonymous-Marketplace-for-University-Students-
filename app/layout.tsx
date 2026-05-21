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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
