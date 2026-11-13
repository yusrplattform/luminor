import 'server-only';
import {database} from './db';

const recipient='fuad@yusr.om';
const money=value=>(value/1000).toFixed(3)+' ر.ع';

export async function sendOrderNotification(orderId,event){
  if(!process.env.RESEND_API_KEY) return false;
  const db=database();
  const claim=await db.query(`UPDATE order_notifications SET claimed_at=now(),attempts=attempts+1
    WHERE order_id=$1 AND event=$2 AND sent_at IS NULL
    AND (claimed_at IS NULL OR claimed_at<now()-interval '5 minutes') RETURNING order_id`,[orderId,event]);
  if(!claim.rowCount)return false;
  try{
    const {rows}=await db.query('SELECT id,customer_name,customer_phone,shipping_address,country,items,subtotal_baisa,shipping_baisa,total_baisa FROM orders WHERE id=$1',[orderId]);
    const order=rows[0]; if(!order)throw new Error('Order unavailable');
    const items=typeof order.items==='string'?JSON.parse(order.items):order.items;
    const lines=items.map(item=>`${item.name} × ${item.quantity} — ${money(item.priceBaisa*item.quantity)}`);
    const text=[event==='paid'?'تم تأكيد الدفع لهذا الطلب.':'تم إنشاء الطلب؛ الدفع غير مؤكد بعد.',`رقم الطلب: ${order.id}`,`الاسم: ${order.customer_name}`,`الهاتف: ${order.customer_phone}`,`الدولة: ${order.country}`,`العنوان: ${order.shipping_address}`,'المنتجات:',...lines,`المنتجات: ${money(order.subtotal_baisa)}`,`الشحن: ${money(order.shipping_baisa)}`,`الإجمالي: ${money(order.total_baisa)}`].join('\n');
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`order/${orderId}/${event}`},body:JSON.stringify({from:'LUMINOR <orders@notify.yusr.om>',to:[recipient],subject:event==='paid'?'LUMINOR: تأكيد دفع طلب':'LUMINOR: طلب جديد بانتظار تأكيد الدفع',text}),signal:AbortSignal.timeout(5000)});
    if(!response.ok)throw new Error(`Email provider HTTP ${response.status}`);
    await db.query('UPDATE order_notifications SET sent_at=now(),claimed_at=NULL WHERE order_id=$1 AND event=$2',[orderId,event]);
    return true;
  }catch(error){
    await db.query('UPDATE order_notifications SET claimed_at=NULL WHERE order_id=$1 AND event=$2',[orderId,event]);
    console.error('Order notification failed',{event,type:error?.name});
    return false;
  }
}

export async function retryOrderNotifications(){
  const {rows}=await database().query('SELECT order_id,event FROM order_notifications WHERE sent_at IS NULL ORDER BY created_at LIMIT 5');
  for(const row of rows)await sendOrderNotification(row.order_id,row.event);
  return rows.length;
}
