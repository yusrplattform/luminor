import Link from 'next/link';
import {Heading} from '../components';
import {posts} from './posts';
export const metadata={title:'مجلة العناية بالشعر والجسم',description:'مقالات ونصائح عملية للعناية بالشعر والجسم والحناء والسدر من مجلة LUMINOR.',alternates:{canonical:'/blog'}};
export default function Blog(){return <><Heading eyebrow="THE LUMINOR JOURNAL" title="مجلة العناية" desc="دليلك إلى روتين عناية بسيط يناسب شعرك وبشرتك."/><section className="section blog-grid">{posts.map(post=><article key={post.slug}><Link href={'/blog/'+post.slug}><div className="blog-img"><img src={post.image} alt="" loading="lazy"/></div><span className="eyebrow">مجلة العناية</span><h2>{post.title}</h2><p>{post.description}</p><span className="text-link">اقرئي المقال</span></Link></article>)}</section></>}
