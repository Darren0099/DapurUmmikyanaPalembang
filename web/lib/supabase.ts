'use client';
// Same-origin authentication adapter for Cloudflare D1.
type AppUser={id:string;email:string;name:string;role:string;app_metadata:{role:string};email_confirmed_at:string};
type AppSession={access_token:string;user:AppUser};
const key='ummi_kyana_session_v1';
function current():AppSession|null{try{if(typeof window==='undefined')return null;const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as AppSession:null}catch{return null}}
async function action(path:string,payload:Record<string,unknown>){try{const res=await fetch('/api/auth/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});return {res,data:await res.json()}}catch{return {res:null,data:{error:'Server tidak dapat dihubungi.'}}}}
export function browserSupabase(){
 return {auth:{
  async signUp({email,password,options}:{email:string;password:string;options?:{data?:{name?:string}}}){const {res,data}=await action('register',{email,password,name:options?.data?.name});return {data:res?.ok?data:null,error:res?.ok?null:new Error(data.error||'Pendaftaran gagal')}},
  async signInWithPassword({email,password}:{email:string;password:string}){const {res,data}=await action('login',{email,password});if(res?.ok){try{localStorage.setItem(key,JSON.stringify({access_token:data.access_token,user:data.user}))}catch{}}return {data:res?.ok?data:null,error:res?.ok?null:new Error(data.error||'Login gagal')}},
  async getSession(){return {data:{session:current()},error:null}},
  async getUser(){return {data:{user:current()?.user||null},error:null}},
  async signOut(){const s=current();if(s){try{await fetch('/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer '+s.access_token}})}catch{}}try{localStorage.removeItem(key)}catch{}return {error:null}}
 }};
}
