import type { Metadata } from 'next';
import './globals.css';
import './editorial.css';
import './warm-editorial.css';
import './food-redesign.css';
import { CartProvider } from '@/components/cart-provider';

export const metadata: Metadata = {
  title: { default: 'Dapur Ummi Kyana | Katering & Nasi Box Palembang', template: '%s | Dapur Ummi Kyana' },
  description: 'Jelajahi menu nasi box dan hidangan rumahan Dapur Ummi Kyana Palembang. Pesan makanan dan ajukan katering secara online dengan proses yang transparan.',
  robots: { index: true, follow: true },
  openGraph:{type:'website',locale:'id_ID',siteName:'Dapur Ummi Kyana',title:'Dapur Ummi Kyana | Katering Palembang',description:'Jelajahi menu nasi box, snack box, tumpeng, dan katering Dapur Ummi Kyana Palembang.'},
  twitter:{card:'summary_large_image'},
  alternates:{canonical:'/'},
  metadataBase: new URL('https://dapur-ummi-kyana-steel.vercel.app'),
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="id"><body><CartProvider>{children}</CartProvider></body></html>;
}
