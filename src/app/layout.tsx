import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Google Keyword Dominator - Free Google Autocomplete Keyword Tool',
  description:
    'Discover genuine Google autocomplete keyword suggestions and long-tail search queries. Target multiple countries, languages, wildcards (*), and A-Z expansion.',
  keywords: [
    'google keyword tool',
    'autocomplete keyword tool',
    'keyword dominator',
    'long-tail keywords',
    'seo keyword research',
    'free keyword tool',
  ],
  authors: [{ name: 'Google Keyword Dominator' }],
  openGraph: {
    title: 'Google Keyword Dominator - Free Google Autocomplete Keyword Tool',
    description:
      'Generate authentic Google autocomplete suggestions with wildcard queries, country targeting, and CSV export.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Google Keyword Dominator',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased text-slate-900 bg-white">
        {children}
      </body>
    </html>
  );
}
