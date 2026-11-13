import Link from 'next/link';
import AddToCart from './add-to-cart';
import products from '../products.json';
export function LowStock({p}){return ['1','10','13','14'].includes(p.id)?<span className="low-stock">على وشك النفاد</span>:null;}
export function ProductImage({p}){const items=p.bundleItems?.map(id=>products.find(item=>item.id===id)).filter(Boolean);return items?.length?<div className="bundle-images">{items.map(item=><img key={item.id} src={'/'+item.image} alt={item.name} loading="lazy" decoding="async"/>)}</div>:<img src={'/'+p.image} alt={p.name} loading="lazy" decoding="async"/>;}
export function ProductCard({p}){return <article className="product"><Link href={'/products/'+p.id}><div className="product-image"><ProductImage p={p}/></div><div className="product-meta"><span>{p.category==='hair'?'العناية بالشعر':p.category==='body'?'العناية بالجسم':p.category==='bundles'?'مجموعة العناية':'اللبان'}</span></div><h3>{p.name}</h3><LowStock p={p}/><div className="product-price">{p.price}</div></Link><AddToCart id={p.id} name={p.name}/></article>}
export function Heading({eyebrow,title,desc}){return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{desc&&<p>{desc}</p>}</div>}
