import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

// Opt-out of SSG globally to stop the pre-render and cache,
// thus stopping the "call API during build" madness
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';
export const runtime = 'nodejs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
