'use client';
import {useState,useEffect} from 'react';
import {flushSync} from 'react-dom';
import Link from 'next/link';
import {quoteCart} from '../../lib/quote.mjs';
export default function Checkout(){
  const [cart,setCart]=useState({}),[country,setCountry]=useState('OM'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[paymentUrl,setPaymentUrl]=useState('');
  useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem('luminor-cart')||'{}'));setCountry(sessionStorage.getItem('luminor-country')||'OM');}catch{}},[]);
  let quote;try{quote=quoteCart(cart,country);}catch{}
  function chooseCountry(value){setCountry(value);sessionStorage.setItem('luminor-country',value);}
  async function submit(e){
    e.preventDefault();if(!quote||busy||paymentUrl)return;setBusy(true);setError('');
    const form=new FormData(e.currentTarget),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch('/api/checkout',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({cart,country,name:form.get('name'),phone:form.get('phone'),address:form.get('address')})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'تعذر بدء الدفع.');
      const destination=new URL(result.redirectUrl);
      if(destination.protocol!=='https:'||!['api.truepay.ompay.om','api.sandbox.truepay.ompay.om'].includes(destination.hostname))throw new Error('تعذر بدء الدفع.');
      flushSync(()=>{setPaymentUrl(destination.href);setBusy(false)});window.location.assign(destination.href);
    }catch(err){setError(err.name==='AbortError'?'تأخر الاتصال. قد يكون الطلب قد أُنشئ؛ تواصلي مع المتجر قبل إعادة المحاولة.':err.message);setBusy(false)}finally{clearTimeout(timeout)}
  }
  return <section className="section cart"><span className="eyebrow">SECURE CHECKOUT</span><h1>إتمام الطلب</h1>{!quote?<p>السلة فارغة أو غير صالحة. <Link href="/shop">العودة إلى المتجر</Link></p>:<div className="checkout-layout"><form onSubmit={submit} className="checkout-form"><h2>بيانات التوصيل</h2><label>الاسم الكامل<input name="name" required minLength={3} maxLength={250} autoComplete="name"/></label><label>رقم الهاتف<input name="phone" type="tel" required minLength={3} maxLength={250} autoComplete="tel"/></label><label>دولة التوصيل<select value={country} onChange={e=>chooseCountry(e.target.value)}><option value="OM">عُمان</option><option value="SA">السعودية</option><option value="AE">الإمارات</option><option value="BH">البحرين</option><option value="QA">قطر</option><option value="KW">الكويت</option></select></label><label>عنوان التوصيل<input name="address" required minLength={3} maxLength={250} autoComplete="street-address" placeholder="الولاية أو المدينة، المنطقة والتفاصيل"/></label><p>بعد المتابعة ستنتقلين إلى صفحة الدفع عبر OMPAY.</p>{error&&<p role="alert">{error}</p>}{paymentUrl?<div role="status"><p>الطلب جاهز. إذا لم تُفتح صفحة الدفع تلقائياً، اضغطي الزر أدناه.</p><a className="btn" href={paymentUrl}>فتح صفحة الدفع</a></div>:<button className="btn" disabled={busy} type="submit">{busy?'جارٍ تجهيز الطلب...':'المتابعة إلى الدفع'}</button>}<Link className="text-link" href="/cart">العودة إلى السلة</Link></form><aside className="checkout-summary"><h2>ملخص الطلب</h2><ul>{quote.items.map(item=><li key={item.id}><span>{item.name} × {item.quantity}</span><span>{(item.priceBaisa*item.quantity/1000).toFixed(3)} ر.ع</span></li>)}</ul><div className="cart-total"><span>المنتجات</span><b>{(quote.subtotalBaisa/1000).toFixed(3)} ر.ع</b></div><div className="cart-total"><span>{country==='OM'?'التوصيل داخل عُمان':'الشحن التقديري'}</span><b>{(quote.shippingBaisa/1000).toFixed(3)} ر.ع</b></div><div className="cart-total grand-total"><span>الإجمالي</span><b>{(quote.totalBaisa/1000).toFixed(3)} ر.ع</b></div><p>{country==='OM'?'مدة التوصيل المعتادة يومان.':'مدة التوصيل المعتادة ٤ إلى ٧ أيام؛ قد تُطبق رسوم جمركية أو ضرائب بحسب الوجهة.'}</p><Link className="text-link" href="/shipping">تفاصيل الشحن والطلبات</Link></aside></div>}</section>;
}
