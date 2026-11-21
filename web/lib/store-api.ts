// Server-only gateway to the Cloudflare Worker backed by D1.
import 'server-only';
export async function storeRequest(request:Request,path:string):Promise<Response>{
 const origin=process.env.STORE_API_URL;
 if(!origin)return Response.json({error:'Database toko belum dikonfigurasi.'},{status:503});
 const method=request.method;
 try{
  const response=await fetch(origin+path,{
   method,
   headers:{'Content-Type':'application/json',...(request.headers.get('authorization')?{Authorization:request.headers.get('authorization')!}:{})},
   body:method==='GET'||method==='HEAD'?undefined:await request.text(),
   cache:'no-store',signal:AbortSignal.timeout(12000)
  });
  return new Response(response.body,{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Layanan pesanan belum dapat dihubungi.'},{status:503})}
}
export async function storeGet(path:string){
 const origin=process.env.STORE_API_URL;
 if(!origin)throw new Error('Store API URL missing');
 const res=await fetch(origin+path,{cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw new Error('Store database unavailable');
 return res.json();
}
