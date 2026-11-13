'use client';
import {useState,useEffect} from 'react';
import Link from 'next/link';
import {quoteCart} from '../../lib/quote.mjs';
export default function Checkout(){
  const [cart,setCart]=useState({}),[country,setCountry]=useState('OM'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem('luminor-cart')||'{}'))}catch{}},[]);
  let quote;try{quote=quoteCart(cart,country)}catch{}
  async function submit(e){
    e.preventDefault();if(!quote||busy)return;setBusy(true);setError('');
    const form=new FormData(e.currentTarget);
    try{
      const response=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cart,country,name:form.get('name'),email:form.get('email'),phone:form.get('phone'),address:form.get('address')})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'تعذر بدء الدفع.');
      const destination=new URL(result.redirectUrl);
      if(destination.protocol!=='https:'||!['api.truepay.ompay.om','api.sandbox.truepay.ompay.om'].includes(destination.hostname))throw new Error('تعذر بدء الدفع.');
      window.location.assign(destination.href);
    }catch(err){setError(err.message);setBusy(false)}
  }
  return <section className="section cart"><span className="eyebrow">SECURE CHECKOUT</span><h1>إتمام الطلب</h1>{!quote?<p>السلة فارغة أو غير صالحة. <Link href="/shop">العودة إلى المتجر</Link></p>:<form onSubmit={submit} className="checkout-form"><label>الاسم الكامل<input name="name" required minLength={3} maxLength={250} autoComplete="name"/></label><label>البريد الإلكتروني<input name="email" type="email" required maxLength={250} autoComplete="email"/></label><label>رقم الهاتف<input name="phone" type="tel" required minLength={3} maxLength={250} autoComplete="tel"/></label><label>دولة التوصيل<select value={country} onChange={e=>setCountry(e.target.value)}><option value="OM">عُمان</option><option value="SA">السعودية</option><option value="AE">الإمارات</option><option value="BH">البحرين</option><option value="QA">قطر</option><option value="KW">الكويت</option></select></label><label>عنوان التوصيل<input name="address" required minLength={3} maxLength={250} autoComplete="street-address"/></label><div className="cart-total"><span>المنتجات</span><b>{(quote.subtotalBaisa/1000).toFixed(3)} ر.ع</b></div><div className="cart-total"><span>الشحن التقديري</span><b>{(quote.shippingBaisa/1000).toFixed(3)} ر.ع</b></div><div className="cart-total"><span>الإجمالي</span><b>{(quote.totalBaisa/1000).toFixed(3)} ر.ع</b></div><p>قد تُطبق رسوم جمركية أو ضرائب بحسب بلد الوجهة. أسعار الشحن تقديرية وفق الوزن المبين في سياسة المتجر.</p>{error&&<p role="alert">{error}</p>}<button className="btn" disabled={busy} type="submit">{busy?'جارٍ تجهيز الطلب...':'المتابعة إلى الدفع الآمن ←'}</button></form>}</section>
}
