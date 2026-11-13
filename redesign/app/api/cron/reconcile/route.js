import {timingSafeEqual} from 'node:crypto';
import {database} from '../../../../lib/db';
import {reconcileOrder} from '../../../../lib/reconcile';
import {retryOrderNotifications} from '../../../../lib/notifications';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request){
  const secret=process.env.CRON_SECRET;
  const actual=request.headers.get('authorization') || '';
  const expected=secret ? `Bearer ${secret}` : '';
  if(!expected || Buffer.byteLength(actual)!==Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(actual),Buffer.from(expected))) return new Response('Unauthorized',{status:401});
  if(process.env.PAYMENTS_ENABLED!=='true') return Response.json({processed:0});
  const {rows}=await database().query("SELECT id,transaction_id,total_baisa,currency,payment_status FROM orders WHERE payment_status IN ('pending','processing','unconfirmed') AND created_at < now()-interval '5 minutes' ORDER BY updated_at ASC LIMIT 10");
  let processed=0;
  await Promise.all(rows.map(async order=>{try{await reconcileOrder(order);processed++}catch{await database().query('UPDATE orders SET updated_at=now() WHERE id=$1',[order.id])}}));
  let notifications=0;try{notifications=await retryOrderNotifications()}catch{console.error('Unable to retry notifications')}
  return Response.json({processed,notifications},{headers:{'Cache-Control':'no-store'}});
}
