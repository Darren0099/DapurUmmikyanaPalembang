import { storeRequest } from '@/lib/store-api';
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:'ID tidak valid.'},{status:400});
 return storeRequest(request,`/admin/catering/${id}`);
}
