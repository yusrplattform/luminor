import Link from 'next/link';
import AddToCart from './add-to-cart';
export function ProductCard({p}){return <article className="product"><Link href={'/products/'+p.id}><div className="product-image"><img src={'/'+p.image} alt={p.name} loading="lazy" decoding="async"/><span className="image-arrow">↗</span></div><div className="product-meta"><span>{p.category==='hair'?'العناية بالشعر':p.category==='body'?'العناية بالجسم':p.category==='bundles'?'مجموعة العناية':'اللبان'}</span></div><h3>{p.name}</h3><div className="product-price">{p.price}</div></Link><AddToCart id={p.id} name={p.name}/></article>}
export function Heading({eyebrow,title,desc}){return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{desc&&<p>{desc}</p>}</div>}
