import { storeRequest } from '@/lib/store-api';
export async function GET(request:Request){
 return storeRequest(request,"/admin/dashboard");
}
