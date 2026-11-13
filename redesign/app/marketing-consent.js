'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
export default function MarketingConsent(){
  const pathname=usePathname();
  useEffect(()=>{
    if(window.LuminorMarketing){window.LuminorMarketing.updateSettings();window.LuminorMarketing.page();return;}
    let script=document.getElementById('luminor-marketing-script');
    if(!script){script=document.createElement('script');script.id='luminor-marketing-script';script.src='/marketing-consent.js';document.body.appendChild(script);}
    const refresh=()=>{window.LuminorMarketing?.updateSettings();window.LuminorMarketing?.page();};
    script.addEventListener('load',refresh);
    return ()=>script.removeEventListener('load',refresh);
  },[pathname]);
  return null;
}
