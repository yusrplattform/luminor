import {database} from '../../../../lib/db';
import {reconcileOrder} from '../../../../lib/reconcile';
export const runtime='nodejs';
export async function GET(request){
  const id=new URL(request.url).searchParams.get('order');
  if(!id||!/^[a-f0-9-]{36}$/.test(id)) return Response.json({status:'unknown'},{status:400});
  try{
    const {rows}=await database().query('SELECT id,transaction_id,total_baisa,currency,payment_status FROM orders WHERE id=$1',[id]);
    const order=rows[0];if(!order)return Response.json({status:'unknown'},{status:404});
    const status=await reconcileOrder(order);
    return Response.json({status},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({status:'unconfirmed'},{status:503})}
}
