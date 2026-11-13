import products from '../products.json';
import {posts} from './blog/posts';
export default function sitemap(){const base=(process.env.NEXT_PUBLIC_SITE_URL || 'https://luminor-ten.vercel.app').replace(/\/$/,'');return ['','/shop','/about','/blog','/shipping',...posts.map(p=>'/blog/'+p.slug),...products.map(p=>'/products/'+p.id)].map(path=>({url:base+path}));}
