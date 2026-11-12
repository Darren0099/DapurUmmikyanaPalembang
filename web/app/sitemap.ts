import type { MetadataRoute } from 'next';
import { services } from '@/lib/services';
const origin = 'https://dapur-ummi-kyana-steel.vercel.app';
export default function sitemap(): MetadataRoute.Sitemap {
 return ['/', '/layanan', ...services.map(s=>'/layanan/'+s.slug)]
  .map(path=>({url:origin+path,lastModified:new Date('2026-11-12T00:00:00.000Z'),changeFrequency:'monthly' as const,priority:path==='/'?1:0.8}));
}
