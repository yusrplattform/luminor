import products from '../../../products.json';
import {notFound} from 'next/navigation';
import Add from '../../add-to-cart';
import {ProductImage} from '../../components';
import Link from 'next/link';

export function generateStaticParams(){return products.map(p=>({id:p.id}));}
export async function generateMetadata({params}){const {id}=await params;const p=products.find(x=>x.id===id);return p?{title:p.name,description:p.description,alternates:{canonical:'/products/'+id}}:{};}
export default async function Product({params}){
  const {id}=await params;const p=products.find(x=>x.id===id);if(!p)notFound();
  const bundle=p.bundleItems?.map(itemId=>products.find(item=>item.id===itemId)).filter(Boolean);
  const question=encodeURIComponent(`مرحباً، أود الاستفسار عن ${p.name}، بما في ذلك المكونات وطريقة الاستخدام والحجم.`);
  const schema={'@context':'https://schema.org','@type':'Product',name:p.name,description:p.description,image:p.image,offers:{'@type':'Offer',priceCurrency:'OMR',price:p.price.match(/[0-9.]+/)?.[0]}};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><section className="product-detail"><div className="detail-image"><ProductImage p={p}/></div><div className="detail-copy"><Link className="crumb" href="/shop">المتجر / المنتجات</Link><span className="eyebrow">LUMINOR CARE</span><h1>{p.name}</h1><div className="detail-price">{p.price}</div><p>{p.description}</p>{bundle&&<div className="bundle-contents"><h2>محتويات البكج</h2><ul>{bundle.map(item=><li key={item.id}><Link href={'/products/'+item.id}>{item.name}</Link></li>)}</ul></div>}<Add id={p.id} image={p.image} name={p.name} detail/><div className="purchase-notes"><p><strong>التوصيل داخل عُمان:</strong> ٢ ر.ع للطلب، والمدة المعتادة يومان.</p><p>خارج عُمان: ٤ إلى ٧ أيام. يظهر إجمالي الطلب والشحن قبل الدفع. <Link href="/shipping">تفاصيل الشحن والطلبات</Link></p><p>إلغاء مجاني قبل الشحن، وطلب إرجاع المنتج غير المفتوح خلال ١٥ يوماً. <Link href="/shipping#returns">شروط الإرجاع</Link></p></div><div className="detail-info"><h2>المكونات وطريقة الاستخدام</h2><p>للتأكد من المكونات والحجم وطريقة الاستخدام المناسبة، تواصلي معنا قبل الشراء.</p><a className="text-link" href={'https://wa.me/96898939222?text='+question}>اسألي عن هذا المنتج عبر واتساب</a></div></div></section></>;
}
