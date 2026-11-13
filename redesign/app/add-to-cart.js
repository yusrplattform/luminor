'use client';

import { useRef, useState } from 'react';

export default function AddToCart({ id, image, name, detail = false }) {
  const [message, setMessage] = useState('');
  const button = useRef(null);

  function add() {
    try {
      const saved = JSON.parse(localStorage.getItem('luminor-cart') || '{}');
      const cart = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
      cart[id] = (Number(cart[id]) || 0) + 1;
      localStorage.setItem('luminor-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('luminor-cart-change'));
      setMessage('تمت الإضافة إلى السلة ✓');
    } catch {
      setMessage('تعذرت الإضافة، يرجى المحاولة مجددًا');
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const source = button.current?.closest('.product, .product-detail')?.querySelector('img');
    const target = document.querySelector('.bag');
    if (!source || !target || !source.animate) return;
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const flying = source.cloneNode();
    flying.className = 'flying-product';
    Object.assign(flying.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
    document.body.appendChild(flying);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const animation = flying.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .55}px, ${dy * .55 - 50}px) scale(.45)`, opacity: .9, offset: .65 },
      { transform: `translate(${dx}px, ${dy}px) scale(.08)`, opacity: 0 }
    ], { duration: 750, easing: 'ease-in-out' });
    animation.onfinish = () => flying.remove();
    animation.oncancel = () => flying.remove();
  }

  return <><button ref={button} type="button" className={detail ? 'btn full' : 'buy-button'} onClick={add} aria-label={`اشترِ الآن: ${name}`}>اشترِ الآن</button><span className="cart-feedback" role="status">{message}</span></>;
}
