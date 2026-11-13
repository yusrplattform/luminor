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
  return <Link className="bag" href="/cart" aria-label={`السلة، ${count} منتجات`}>السلة {count>0&&<span className="bag-count">{count}</span>}</Link>;
}
