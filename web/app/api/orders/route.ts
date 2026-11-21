import { storeRequest } from '@/lib/store-api';
export async function POST(request:Request){
 return storeRequest(request,"/orders");
}
