import type { Metadata } from 'next';
import './globals.css';
import './editorial.css';
import './warm-editorial.css';
import { CartProvider } from '@/components/cart-provider';

export const metadata: Metadata = {
  title: { default: 'Dapur Ummi Kyana | Katering & Nasi Box Palembang', template: '%s | Dapur Ummi Kyana' },
  description: 'Jelajahi menu nasi box dan hidangan rumahan Dapur Ummi Kyana Palembang. Hubungi tim untuk ketersediaan dan pemesanan.',
  robots: { index: true, follow: true },
  metadataBase: new URL('https://dapur-ummi-kyana-steel.vercel.app'),
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="id"><body><CartProvider>{children}</CartProvider></body></html>;
}
