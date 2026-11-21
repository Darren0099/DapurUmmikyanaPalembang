'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { browserStoreAuth } from '@/lib/auth-client';
import { archiveFeatures } from '@/lib/archive-media';

export default function LoginPage(){
 const auth=useMemo(()=>browserStoreAuth(),[]);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [name,setName]=useState('');
 const [register,setRegister]=useState(false);
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState('');
 const [noticeType,setNoticeType]=useState<'success'|'error'>('error');
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setNotice('');
  try{
    if(register){
      const {error}=await auth.auth.signUp({email,password,options:{data:{name}}});
      if(error)throw error;
      setNotice('Akun demo berhasil dibuat. Silakan masuk menggunakan email dan kata sandi yang sama.');
      setNoticeType('success');setRegister(false);
    }else{
      const {error}=await auth.auth.signInWithPassword({email,password});
      if(error)throw error;
      const {data}=await auth.auth.getUser();
      if(!data.user)throw new Error('Akun tidak ditemukan.');
      const requested=new URLSearchParams(window.location.search).get('next');
      window.location.assign(data.user.app_metadata?.role==='admin'?'/admin':requested==='checkout'?'/checkout':'/account');
    }
  }catch(error){setNotice(error instanceof Error?error.message:'Autentikasi gagal.');setNoticeType('error')}
  finally{setBusy(false)}
 }
 const switchMode=(toRegister:boolean)=>{setRegister(toRegister);setNotice('');setShowPassword(false)};
 return <main className="duy-auth">
  <div className="duy-auth-shell">
   <aside className="duy-auth-story">
    <Link href="/" className="duy-auth-brand"><span className="duy-auth-monogram">D<span>•</span></span><span>Dapur Ummi Kyana<small>HOMEMADE IN PALEMBANG</small></span></Link>
    <div className="duy-auth-story-content">
      <span className="duy-auth-overline"><Sparkles size={16}/> GOOD FOOD. GOOD MOMENTS.</span>
      <h1>A little taste<br/>of <em>home.</em></h1>
      <p>Menu favorit keluarga dan katering untuk setiap momen. Pesan, pantau, dan nikmati pengalaman yang lebih mudah.</p>
      <div className="duy-auth-art">
        <div className="duy-auth-art-orbit"/>
        <Image src={archiveFeatures.nasiBritani} fill sizes="(max-width: 850px) 70vw, 440px" alt="Sajian makanan dari arsip Dapur Ummi Kyana" className="duy-auth-food-image" priority/>
        <span className="duy-auth-art-tag"><Check size={16}/> From our kitchen</span>
      </div>
    </div>
    <div className="duy-auth-story-footer"><span>EST. PALEMBANG</span><span>— DAPUR UMMI KYANA</span></div>
   </aside>
   <section className="duy-auth-panel">
     <div className="duy-auth-panel-top"><Link href="/" className="duy-auth-back"><ArrowLeft size={17}/> Kembali ke menu</Link><span>NEW HERE? <button type="button" onClick={()=>switchMode(!register)}>{register?'SIGN IN':'SIGN UP'} <ArrowRight size={14}/></button></span></div>
     <div className="duy-auth-content">
      <span className="duy-auth-step">YOUR ACCOUNT / {register?'02':'01'}</span>
      <div className="duy-auth-title" key={register?'signup':'signin'}>
       <h2>{register?<>Create your<br/><em>account.</em></>:<>Welcome<br/><em>back.</em></>}</h2>
       <p>{register?'Buat akun untuk menyimpan dan memantau pesananmu.':'Senang melihatmu kembali. Masuk untuk melanjutkan pesananmu.'}</p>
      </div>
      <div className="duy-auth-tabs" role="group" aria-label="Pilih masuk atau daftar">
       <button className={!register?'active':''} onClick={()=>switchMode(false)} type="button" aria-pressed={!register}>Masuk</button>
       <button className={register?'active':''} onClick={()=>switchMode(true)} type="button" aria-pressed={register}>Daftar akun</button>
      </div>
      <form className="duy-auth-form" onSubmit={submit}>
       {register&&<label className="duy-auth-field"><span>NAMA LENGKAP</span><span className="duy-auth-input"><UserRound size={19}/><input autoComplete="name" minLength={3} maxLength={100} required placeholder="Nama lengkap kamu" value={name} onChange={e=>setName(e.target.value)}/></span></label>}
       <label className="duy-auth-field"><span>EMAIL ADDRESS</span><span className="duy-auth-input"><Mail size={19}/><input type="email" autoComplete="email" required placeholder="nama@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></span></label>
       <label className="duy-auth-field"><span>PASSWORD</span><span className="duy-auth-input"><LockKeyhole size={19}/><input type={showPassword?'text':'password'} autoComplete={register?'new-password':'current-password'} minLength={10} maxLength={128} required placeholder="Minimal 10 karakter" value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShowPassword(x=>!x)} aria-label={showPassword?'Sembunyikan kata sandi':'Lihat kata sandi'}>{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button></span></label>
       {register&&<div className="duy-auth-guidance"><Check size={15}/> Kata sandi minimal 10 karakter</div>}
       {notice&&<div className={'duy-auth-notice '+(noticeType==='success'?'success':'error')} role="status">{notice}</div>}
       <button className="duy-auth-submit" type="submit" disabled={busy}>{busy?'Memproses...':register?'Buat akun sekarang':'Masuk ke akun'} <ArrowRight size={19}/></button>
      </form>
      <p className="duy-auth-switch">{register?'Sudah punya akun?':'Belum punya akun?'} <button type="button" onClick={()=>switchMode(!register)}>{register?'Masuk di sini':'Buat akun gratis'}</button></p>
      <div className="duy-auth-demo"><LockKeyhole size={15}/> Situs dalam mode demo. Pembayaran hanyalah simulasi, tidak memindahkan uang.</div>
     </div>
     <div className="duy-auth-panel-footer">© {new Date().getFullYear()} Dapur Ummi Kyana <span>MADE WITH CARE</span></div>
   </section>
  </div>
 </main>;
}
