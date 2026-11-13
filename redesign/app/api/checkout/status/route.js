import {database} from '../../../../lib/db';
import {createOmpayClient} from '../../../../lib/ompay.mjs';
export const runtime='nodejs';
export async function GET(request){
  const id=new URL(request.url).searchParams.get('order');
  if(!id||!/^[a-f0-9-]{36}$/.test(id)) return Response.json({status:'unknown'},{status:400});
  try{
    const {rows}=await database().query('SELECT id,transaction_id,total_baisa,currency,payment_status FROM orders WHERE id=$1',[id]);
    const order=rows[0];if(!order)return Response.json({status:'unknown'},{status:404});
    if(!order.transaction_id)return Response.json({status:'unconfirmed'});
    const client=createOmpayClient({key:process.env.OMPAY_API_KEY,secret:process.env.OMPAY_API_SECRET,environment:process.env.OMPAY_ENV});
    const result=await client.inquire(order.transaction_id);
    let status='processing';
    if(result.transaction_id!==order.transaction_id || result.reference_number!==order.id || result.currency!==order.currency || Math.round(Number(result.amount)*1000)!==order.total_baisa) status='unconfirmed';
    else if(result.status==='SUCCESSFUL')status='paid';
    else if(result.outcome_unconfirmed)status='unconfirmed';
    else if(result.status==='FAILED')status='failed';
    await database().query('UPDATE orders SET payment_status=$1,updated_at=now() WHERE id=$2',[status,id]);
    return Response.json({status},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({status:'unconfirmed'},{status:503})}
}
