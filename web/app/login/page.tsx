'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, LockKeyhole, UtensilsCrossed } from 'lucide-react';
import { browserSupabase } from '@/lib/supabase';
export default function LoginPage(){
 const supabase=useMemo(()=>browserSupabase(),[]);
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [name,setName]=useState('');
 const [register,setRegister]=useState(false);const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');
 async function submit(e:React.FormEvent){
   e.preventDefault(); if(!supabase)return;
   setBusy(true);setNotice('');
   try{
     if(register){
       const {error}=await supabase.auth.signUp({email,password,options:{data:{name}}});
       if(error)throw error;
       setNotice('Pendaftaran diterima. Cek email untuk mengaktifkan akun sebelum login.');setRegister(false);
     }else{
       const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
       const {data}=await supabase.auth.getUser();
       if(!data.user?.email_confirmed_at){await supabase.auth.signOut();throw new Error('Verifikasi email terlebih dahulu.')}
       const requested=new URLSearchParams(window.location.search).get('next');
       window.location.assign(data.user.app_metadata?.role==='admin'?'/admin':requested==='checkout'?'/checkout':'/');
     }
   }catch(error){setNotice(error instanceof Error?error.message:'Autentikasi gagal.')}finally{setBusy(false)}
 }
 return <main className="login-shell"><div className="login-art"><Link href="/" className="logo-lockup"><span className="logo-symbol"><UtensilsCrossed size={23}/></span><span><strong>Dapur Ummi</strong><small>KYANA • PALEMBANG</small></span></Link><div><h1>Dari dapur hangat,<br/><em>untuk setiap cerita.</em></h1><p>Masuk untuk melihat pesananmu atau mengelola operasional dapur melalui panel admin.</p></div><span style={{fontSize:12,color:'#9eb9a3'}}>DAPUR UMMI KYANA / ACCOUNT ACCESS</span></div><div className="login-form-wrap"><div className="login-form"><div className="eyebrow"><LockKeyhole size={14}/> AKSES AKUN</div><h2>{register?'Buat akun.':'Selamat datang.'}</h2><p>{register?'Daftar untuk menyimpan pesanan di aplikasi.':'Masuk dengan email dan kata sandi yang terdaftar.'}</p>{!supabase?<div className="notice">Autentikasi belum aktif. Hubungkan project Supabase terlebih dahulu. Pengunjung tetap dapat menghubungi penjual melalui WhatsApp.</div>:<form onSubmit={submit}>{register&&<div className="field"><label htmlFor="name">Nama lengkap</label><input id="name" minLength={3} required value={name} onChange={e=>setName(e.target.value)} placeholder="Nama kamu"/></div>}<div className="field"><label htmlFor="email">Email</label><input type="email" id="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="nama@email.com"/></div><div className="field"><label htmlFor="password">Kata sandi</label><input type="password" id="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} autoComplete={register?'new-password':'current-password'} placeholder="Minimal 8 karakter"/></div>{notice&&<p className="error-text" role="alert">{notice}</p>}<button className="btn btn-primary btn-full" disabled={busy} type="submit">{busy?'Memproses...':register?'Daftar akun':'Masuk ke akun'} <ArrowRight size={17}/></button><button type="button" className="small-link" onClick={()=>{setRegister(!register);setNotice('')}}>{register?'Sudah punya akun? Masuk':'Belum punya akun? Daftar sekarang'}</button></form>}<br/><Link href="/" className="small-link"><ArrowLeft size={14}/> Kembali ke toko</Link></div></div></main>
}
