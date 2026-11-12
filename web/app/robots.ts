import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
 return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/api/','/checkout']}],sitemap:'https://dapur-ummi-kyana-steel.vercel.app/sitemap.xml'};
}
