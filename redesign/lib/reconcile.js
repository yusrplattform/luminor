import {database} from './db';
import {createOmpayClient} from './ompay.mjs';

export async function reconcileOrder(order) {
  const client=createOmpayClient({key:process.env.OMPAY_API_KEY,secret:process.env.OMPAY_API_SECRET,environment:process.env.OMPAY_ENV});
  const result=await client.inquire(order.transaction_id,order.id);
  let status='unconfirmed';
  const matches=(!order.transaction_id || result.transaction_id===order.transaction_id) && result.reference_number===order.id && result.currency===order.currency && Math.round(Number(result.amount)*1000)===order.total_baisa;
  if (matches) {
    if(result.status==='SUCCESSFUL' && !result.outcome_unconfirmed) status='paid';
    else if(result.status==='FAILED' && !result.outcome_unconfirmed) status='failed';
    else status='processing';
  }
  const {rows}=await database().query("UPDATE orders SET payment_status=CASE WHEN payment_status='paid' THEN 'paid' ELSE $1 END, transaction_id=COALESCE(transaction_id,$2), updated_at=now() WHERE id=$3 RETURNING payment_status",[status,matches ? result.transaction_id || null : null,order.id]);
  return rows[0]?.payment_status || status;
}
