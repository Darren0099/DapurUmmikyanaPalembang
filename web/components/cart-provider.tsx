'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type CartItem = { slug: string; quantity: number };
type CartContext = {
  items: CartItem[];
  add: (slug: string) => void;
  subtract: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
};
const Context = createContext<CartContext | null>(null);
const storageKey = 'dapur-ummi-cart-v2';
export function CartProvider({ children }: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(parsed)) setItems(parsed.filter(x => typeof x?.slug === 'string' && Number.isInteger(x.quantity) && x.quantity >= 1 && x.quantity <= 50).slice(0,30));
    } catch { /* malformed local cache resets automatically */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(storageKey, JSON.stringify(items)); }, [items, hydrated]);
  const add = useCallback((slug:string) => setItems(prev => prev.some(i=>i.slug===slug) ? prev.map(i=>i.slug===slug?{...i,quantity:Math.min(50,i.quantity+1)}:i) : [...prev,{slug,quantity:1}]), []);
  const subtract = useCallback((slug:string) => setItems(prev => prev.map(i=>i.slug===slug?{...i,quantity:i.quantity-1}:i).filter(i=>i.quantity>0)), []);
  const remove = useCallback((slug:string) => setItems(prev=>prev.filter(i=>i.slug!==slug)), []);
  const clear = useCallback(()=>setItems([]), []);
  const count = useMemo(()=>items.reduce((sum,i)=>sum+i.quantity,0),[items]);
  return <Context.Provider value={{items,add,subtract,remove,clear,count}}>{children}</Context.Provider>;
}
export function useCart() { const cart = useContext(Context); if(!cart) throw new Error('CartProvider missing'); return cart; }
