import { storeRequest } from '@/lib/store-api';
const supported=new Set(['register','login','logout','me']);
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 const {action}=await params;
 if(!supported.has(action)||action==='me')return Response.json({error:'Not found'},{status:404});
 return storeRequest(request,'/auth/'+action);
}
export async function GET(request:Request,{params}:{params:Promise<{action:string}>}){
 const {action}=await params;
 if(action!=='me')return Response.json({error:'Not found'},{status:404});
 return storeRequest(request,'/auth/me');
}
