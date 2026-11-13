'use client';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {Suspense} from 'react';
function Result(){
  const params=useSearchParams(),[status,setStatus]=useState('loading');
  const started=useRef(false),paidOrder=useRef(null),claiming=useRef(false);
  useEffect(()=>{
    if(started.current)return;started.current=true;
    const order=params.get('order')||window.history.state?.luminorOrder;
    if(!order){setStatus('unconfirmed');return;}
    fetch('/api/checkout/status?order='+encodeURIComponent(order),{cache:'no-store'})
      .then(r=>{if(!r.ok)throw Error();return r.json();}).then(x=>{
        setStatus(x.status);
        if(x.status!=='paid')return;
        try { localStorage.removeItem('luminor-cart'); } catch {}
        paidOrder.current=order;
        // Do not expose the order identifier in the URL seen by the Pixel.
        window.history.replaceState({...window.history.state,luminorOrder:order},'',window.location.pathname);
        window.dispatchEvent(new Event('luminor-paid-order-ready'));
      }).catch(()=>setStatus('unconfirmed'));
  },[params]);
  useEffect(()=>{
    async function sendPurchase(){
      const order=paidOrder.current, marketing=window.LuminorMarketing;
      if(!order||claiming.current||!marketing?.hasConsent())return;
      claiming.current=true;
      try{
        const response=await fetch('/api/checkout/meta-purchase',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order}),cache:'no-store'});
        if(!response.ok)return;
        const {purchase}=await response.json();
        if(purchase&&marketing.hasConsent())marketing.purchase(purchase,purchase.eventID);
      }catch{}finally{claiming.current=false;}
    }
    const names=['luminor-paid-order-ready','luminor-marketing-ready','luminor-marketing-consent-change'];
    names.forEach(name=>window.addEventListener(name,sendPurchase));sendPurchase();
    return ()=>names.forEach(name=>window.removeEventListener(name,sendPurchase));
  },[]);
  const text={loading:'جارٍ التحقق من حالة الدفع...',paid:'تم الدفع بنجاح. شكراً لطلبكِ.',processing:'الدفع قيد المعالجة. تواصلي معنا للتحقق قبل إعادة المحاولة.',failed:'لم تكتمل عملية الدفع. يمكنك التواصل معنا للمساعدة.',unconfirmed:'لم نتمكن من تأكيد حالة الدفع. تواصلي معنا قبل إعادة المحاولة.',unknown:'لم نعثر على الطلب.'};
  return <section className="section cart"><h1>حالة الطلب</h1><p>{text[status]||text.unconfirmed}</p><a className="text-link" href="https://wa.me/96898939222">تواصلي معنا عبر واتساب ←</a></section>;
}
export default function Page(){return <Suspense fallback={<p>جارٍ التحميل...</p>}><Result/></Suspense>}
