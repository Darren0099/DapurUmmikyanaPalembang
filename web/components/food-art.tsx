import type { Product } from '@/lib/catalog';
export default function FoodArt({ product, compact=false }: {product:Product;compact?:boolean}) {
  return <div className={`food-art food-art--${product.accent || 'amber'} ${compact?'food-art--compact':''}`} aria-hidden="true">
    <div className="food-sun"/><div className="food-orbit one"/><div className="food-orbit two"/>
    <svg className="food-plate" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
      <ellipse cx="170" cy="263" rx="114" ry="20" fill="#452515" opacity=".13"/>
      <ellipse cx="170" cy="146" rx="124" ry="116" fill="#FFF5E3" stroke="#F4DEBE" strokeWidth="10"/>
      <ellipse cx="170" cy="146" rx="102" ry="96" fill="#FFFDFC" stroke="#EFE3CB" strokeWidth="2"/>
      <ellipse cx="133" cy="138" rx="56" ry="51" fill="#FCF6E9"/>
      <ellipse cx="135" cy="130" rx="49" ry="44" fill="#FFFAEC"/>
      {[0,1,2,3,4,5,6,7].map((i)=><path key={i} d={`M${99+i*10} ${116+(i%3)*8}q10 -5 13 4`} stroke="#EADBC7" strokeWidth="2" strokeLinecap="round"/>)}
      <path d="M181 104c17-23 58-25 76 4 16 30-5 63-34 68-28 3-58-14-62-38-3-14 6-25 20-34Z" fill="#943916"/>
      <path d="M181 102c22-18 57-11 65 14 8 26-20 53-49 48-28-4-36-42-16-62Z" fill="#C95C27"/>
      <path d="M184 112c20-14 44-6 52 11" stroke="#E99551" strokeWidth="9" strokeLinecap="round"/>
      <path d="M170 184c15-17 34-21 54-16 21 6 29 18 27 37-24 27-54 28-79 12-15-10-17-22-2-33Z" fill="#4E7B3F"/>
      <path d="M175 199c10-20 29-21 45-13m-18 26c9-22 25-22 36-17" stroke="#8EBF5C" strokeWidth="9" strokeLinecap="round"/>
      <circle cx="233" cy="95" r="12" fill="#E6512C"/><circle cx="239" cy="188" r="8" fill="#F1AE3E"/><circle cx="204" cy="94" r="7" fill="#F4B041"/>
      <path d="M91 188c0-14 13-28 27-31 16-4 37 1 42 16 5 18-5 35-24 40-18 5-45-4-45-25Z" fill="#D7A34A" opacity=".78"/>
    </svg>
    <span className="food-art-mark">Dapur Ummi Kyana</span>
  </div>;
}
