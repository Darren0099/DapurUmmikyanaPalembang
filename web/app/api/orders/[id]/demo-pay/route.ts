import { storeRequest } from '@/lib/store-api';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:'ID tidak valid.'},{status:400});
 return storeRequest(request,`/orders/${id}/demo-pay`);
}
