'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';

export default function CartLink(){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    const refresh=()=>{try{const cart=JSON.parse(localStorage.getItem('luminor-cart')||'{}');setCount(Object.values(cart).reduce((sum,n)=>sum+(Number(n)||0),0))}catch{setCount(0)}};
    refresh();window.addEventListener('luminor-cart-change',refresh);window.addEventListener('storage',refresh);
    return ()=>{window.removeEventListener('luminor-cart-change',refresh);window.removeEventListener('storage',refresh)};
  },[]);
  return <Link className="bag" href="/cart" aria-label={`السلة، ${count} منتجات`}><svg className="bag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg>{count>0&&<span className="bag-count">{count}</span>}</Link>;
}
