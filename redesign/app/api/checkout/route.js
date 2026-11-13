import {randomUUID} from 'node:crypto';
import {database} from '../../../lib/db';
import {quoteCart} from '../../../lib/quote.mjs';
import {createOmpayClient} from '../../../lib/ompay.mjs';
export const runtime='nodejs';
export async function POST(request){
  const base=process.env.NEXT_PUBLIC_SITE_URL;
  if(!base || request.headers.get('origin')!==new URL(base).origin) return Response.json({error:'تعذر بدء الطلب.'},{status:403});
  let input,quote;
  try{
    input=await request.json();
    for(const key of ['name','email','phone','address']) if(typeof input[key]!=='string'||input[key].trim().length<3||input[key].length>250) throw Error();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw Error();
    quote=quoteCart(input.cart,input.country);
  }catch{return Response.json({error:'تحققي من بيانات الطلب.'},{status:400})}
  if(process.env.PAYMENTS_ENABLED!=='true'||!process.env.OMPAY_API_KEY||!process.env.OMPAY_API_SECRET||!process.env.DATABASE_URL||!['sandbox','production'].includes(process.env.OMPAY_ENV)) return Response.json({error:'الدفع الإلكتروني غير متاح حالياً. تواصلي معنا عبر واتساب.'},{status:503});
  const id=randomUUID();
  try{
    await database().query('INSERT INTO orders (id,customer_name,customer_phone,customer_email,shipping_address,country,items,subtotal_baisa,shipping_baisa,total_baisa) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,input.name.trim(),input.phone.trim(),input.email.trim(),input.address.trim(),input.country,JSON.stringify(quote.items),quote.subtotalBaisa,quote.shippingBaisa,quote.totalBaisa]);
    const client=createOmpayClient({key:process.env.OMPAY_API_KEY,secret:process.env.OMPAY_API_SECRET,environment:process.env.OMPAY_ENV});
    const result=await client.createCheckout({amountBaisa:quote.totalBaisa,reference:id,returnUrl:new URL('/checkout/return?order='+id,base).toString()});
    await database().query("UPDATE orders SET transaction_id=$1,payment_status='processing',updated_at=now() WHERE id=$2",[result.transactionId,id]);
    return Response.json({redirectUrl:result.redirectUrl});
  }catch{
    // A timeout may mean the provider created a transaction: never retry automatically.
    try{await database().query("UPDATE orders SET payment_status='unconfirmed',updated_at=now() WHERE id=$1",[id])}catch{}
    return Response.json({error:'تعذر بدء الدفع. تواصلي مع المتجر قبل المحاولة مجدداً.'},{status:503});
  }
}
