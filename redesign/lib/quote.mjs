import products from '../products.json' with {type:'json'};
const allowed = new Set(['OM','SA','AE','BH','QA','KW']);
export function quoteCart(cart,country){
  if(!allowed.has(country) || !cart || typeof cart!=='object' || Array.isArray(cart)) throw new Error('invalid cart');
  const entries=Object.entries(cart);
  if(!entries.length || entries.length>20) throw new Error('invalid cart');
  let subtotalBaisa=0, weight=0, hasOil=false, count=0;
  const items=entries.map(([id,quantity])=>{
    const p=products.find(p=>p.id===id);
    if(!p || !Number.isSafeInteger(quantity) || quantity<1 || quantity>20) throw new Error('invalid item');
    count+=quantity;
    const price=Number(p.price.match(/^[0-9]+\.[0-9]{3}/)?.[0])*1000;
    if(!Number.isSafeInteger(price)) throw new Error('invalid price');
    subtotalBaisa+=price*quantity;
    weight+=(id==='1'?2000:500)*quantity;
    hasOil ||= id==='1'||id==='10';
    return {id,name:p.name,quantity,priceBaisa:price};
  });
  if(count>50) throw new Error('too many items');
  const shippingBaisa=country==='OM'?2000:Math.max(7000,weight*(hasOil?9:7));
  return {items,subtotalBaisa,shippingBaisa,totalBaisa:subtotalBaisa+shippingBaisa};
}
