import products from '../products.json';
export default function sitemap(){const base=process.env.NEXT_PUBLIC_SITE_URL || 'https://luminor-ten.vercel.app';const paths=['','/shop','/about','/blog','/blog/hair-ritual','/blog/self-care','/shipping',...products.map(p=>'/products/'+p.id)];return paths.map(path=>({url:base.replace(/\/$/,'')+path}));}
