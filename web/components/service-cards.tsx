import Link from 'next/link';
import { ArrowUpRight, CalendarDays, ChefHat, Gift, HandPlatter, type LucideIcon } from 'lucide-react';
import { services, serviceInquiryUrl, type Service } from '@/lib/services';

const icons:Record<Service['slug'],LucideIcon> = {
  'daily-catering': CalendarDays,
  'snack-box': Gift,
  'tumpeng-mini': ChefHat,
  'prasmanan-gubukan': HandPlatter,
};

export default function ServiceCards({compact=false}:{compact?:boolean}) {
  return <div className={`services-grid services-grid--editorial ${compact?'services-grid--compact':''}`}>
    {services.map((service,index)=>{
      const Icon = icons[service.slug];
      return <article className="service-card service-card--enhanced" key={service.slug} style={{animationDelay:`${index*85}ms`}}>
        <span className="service-index">{service.index} / LAYANAN</span>
        <div className="service-icon-stage"><div className="service-icon-halo" aria-hidden="true"/><Icon size={38} strokeWidth={1.6} aria-hidden="true"/></div>
        <span className="service-kicker">{service.kicker}</span>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <div className="service-actions">
          <Link className="service-detail-link" href={`/layanan/${service.slug}`}>Lihat detail <ArrowUpRight size={16} aria-hidden="true"/></Link>
          <a className="service-inquiry-link" href={serviceInquiryUrl(service)} target="_blank" rel="noopener noreferrer">Tanyakan paket</a>
        </div>
      </article>;
    })}
  </div>;
}
