'use client';
import {useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
function Result(){
  const params=useSearchParams(),[status,setStatus]=useState('loading');
  useEffect(()=>{const order=params.get('order');if(!order){setStatus('unconfirmed');return}fetch('/api/checkout/status?order='+encodeURIComponent(order),{cache:'no-store'}).then(r=>r.json()).then(x=>{setStatus(x.status);if(x.status==='paid')localStorage.removeItem('luminor-cart')}).catch(()=>setStatus('unconfirmed'))},[params]);
  const text={loading:'جارٍ التحقق من حالة الدفع...',paid:'تم الدفع بنجاح. شكراً لطلبكِ.',processing:'الدفع قيد المعالجة. تواصلي معنا للتحقق قبل إعادة المحاولة.',failed:'لم تكتمل عملية الدفع. يمكنك التواصل معنا للمساعدة.',unconfirmed:'لم نتمكن من تأكيد حالة الدفع. تواصلي معنا قبل إعادة المحاولة.',unknown:'لم نعثر على الطلب.'};
  return <section className="section cart"><h1>حالة الطلب</h1><p>{text[status]||text.unconfirmed}</p><a className="text-link" href="https://wa.me/96898939222">تواصلي معنا عبر واتساب ←</a></section>;
}
export default function Page(){return <Suspense fallback={<p>جارٍ التحميل...</p>}><Result/></Suspense>}
