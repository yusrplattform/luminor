const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const script=fs.readFileSync('public/marketing-consent.js','utf8');
function setup(consent,pathname='/',search=''){
  const storage=new Map(consent?[['luminor-marketing-consent-v2',consent]]:[]), scripts=[],nodes=[];
  const element=tag=>({tag,dataset:{},children:[],addEventListener(type,fn){this[type]=fn},setAttribute(){},append(...x){this.children.push(...x)},appendChild(x){this.children.push(x)},replaceChildren(){this.children=[]}});
  const document={currentScript:{dataset:{pixelId:'999999999999999'}},head:{appendChild(x){scripts.push(x.src)}},body:{appendChild(x){nodes.push(x)}},createElement:element,querySelector(){return null},querySelectorAll(){return []}};
  const location={pathname,search,hash:'',reload(){this.reloaded=true}};
  const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
  const window={addEventListener(){},dispatchEvent(){},history:{state:null,replaceState(_state,_title,url){const parsed=new URL(url,'http://example.test');location.pathname=parsed.pathname;location.search=parsed.search;location.hash=parsed.hash;}}};
  vm.runInNewContext(script,{window,document,location,localStorage,URLSearchParams,Event:function(type){this.type=type}});
  return {window,location,localStorage,scripts,banner:nodes[0]};
}
const calls=env=>Array.from(env.window.fbq.queue).filter(c=>c[0]==='trackSingle');
test('no script or event without consent, rejection and revocation',()=>{
  const e=setup();e.window.LuminorMarketing.track('AddToCart',{content_ids:['1'],value:25,currency:'OMR'});assert.equal(e.scripts.length,0);
  e.banner.children[2].click();assert.equal(e.scripts.length,0);
  e.banner.children[1].click();assert.equal(e.scripts.length,2);
  assert.equal(e.scripts.filter(src=>src==='https://www.googletagmanager.com/gtm.js?id=GTM-PRDPLZK8').length,1);
  e.banner.children[2].click();assert.equal(e.location.reloaded,true);
  const count=calls(e).length;e.window.LuminorMarketing.track('AddToCart',{content_ids:['1'],value:25,currency:'OMR'});assert.equal(calls(e).length,count);
});
test('previous Meta-only consent does not authorize Google',()=>{
  const e=setup();e.localStorage.setItem('luminor-marketing-consent-v1','accepted');
  e.window.LuminorMarketing.page();assert.equal(e.scripts.length,0);
});
test('Google Tag Manager receives exactly one initialization event after consent',()=>{
  const e=setup();
  assert.equal(e.window.dataLayer,undefined);
  e.banner.children[1].click();
  e.window.LuminorMarketing.page();
  const starts=e.window.dataLayer.filter(entry=>entry.event==='gtm.js');
  assert.equal(starts.length,1);
  assert.equal(typeof starts[0]['gtm.start'],'number');
});
test('routes are counted once per navigation and events carry only approved fields',()=>{
  const e=setup('accepted','/products/1');
  e.window.LuminorMarketing.page();assert.deepEqual(calls(e).map(c=>c[2]),['PageView','ViewContent']);
  e.location.pathname='/cart';e.window.LuminorMarketing.page();e.window.LuminorMarketing.page();
  e.window.LuminorMarketing.track('AddToCart',{content_ids:['1'],value:25,currency:'OMR',name:'private'});
  e.window.LuminorMarketing.track('InitiateCheckout',{content_ids:['1','2'],value:39,currency:'OMR'});
  const track=calls(e);assert.deepEqual(track.map(c=>c[2]),['PageView','ViewContent','PageView','AddToCart','InitiateCheckout']);
  assert.equal(track[3][3].name,undefined);assert.equal(track[3][3].value,25);assert.equal(track[4][3].currency,'OMR');
  assert.equal(track[4][1],'999999999999999');
});
test('checkout and arbitrary query pages do not load Pixel; confirmed purchase requires sanitized return and consent',()=>{
  const q=setup('accepted','/products/1','?phone=123');assert.equal(q.scripts.length,0);
  const e=setup('accepted','/checkout/return','?order=secret');assert.equal(e.scripts.length,0);
  const details={content_ids:['1'],value:27,currency:'OMR'},id='a'.repeat(64);
  assert.equal(e.window.LuminorMarketing.purchase(details,id),false);
  e.location.search='';assert.equal(e.window.LuminorMarketing.purchase(details,id),true);
  assert.equal(calls(e)[0][2],'Purchase');assert.equal(calls(e)[0][4].eventID,id);
});
test('consented campaign visits count after removing campaign parameters',()=>{
  const e=setup('accepted','/shop','?utm_source=facebook&fbclid=example');
  assert.equal(e.location.search,'');
  assert.deepEqual(calls(e).map(c=>c[2]),['PageView']);
  e.location.hash='#hair';e.window.LuminorMarketing.track('AddToCart',{content_ids:['1'],value:25,currency:'OMR'});
  assert.equal(calls(e)[1][2],'AddToCart');
});
test('Google click IDs survive while other campaign details are removed',()=>{
  const e=setup('accepted','/shop','?gclid=test_click_id&utm_source=google');
  assert.equal(e.location.search,'?gclid=test_click_id');
  assert.equal(e.scripts.filter(src=>src.includes('GTM-PRDPLZK8')).length,1);
  assert.equal(e.scripts.filter(src=>src.includes('fbevents')).length,0);
});
test('Tag Assistant debug parameter loads Google only after consent',()=>{
  const e=setup(null,'/shop','?_dbg=1');
  assert.equal(e.scripts.length,0);
  e.banner.children[1].click();
  assert.equal(e.location.search,'?_dbg=1');
  assert.equal(e.scripts.filter(src=>src.includes('GTM-PRDPLZK8')).length,1);
  assert.equal(e.scripts.filter(src=>src.includes('fbevents')).length,0);
});
test('Tag Assistant gtm_debug parameter loads Google only after consent',()=>{
  const e=setup(null,'/shop','?gtm_debug=1794591155275');
  assert.equal(e.scripts.length,0);
  e.banner.children[1].click();
  assert.equal(e.location.search,'?gtm_debug=1794591155275');
  assert.equal(e.scripts.filter(src=>src.includes('GTM-PRDPLZK8')).length,1);
});
test('a local fake endpoint receives consented page and cart events without contacting Meta',async()=>{
  const http=require('node:http');
  const received=[];
  const server=http.createServer((req,res)=>{let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{received.push(JSON.parse(body));res.end('ok');});});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const e=setup();
    e.window.LuminorMarketing.track('AddToCart',{content_ids:['1'],value:25,currency:'OMR'});
    assert.equal(received.length,0);
    e.banner.children[1].click();
    e.window.LuminorMarketing.track('AddToCart',{content_ids:['1'],value:25,currency:'OMR'});
    for(const call of calls(e)) await fetch(`http://127.0.0.1:${server.address().port}/`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Array.from(call))});
    assert.deepEqual(received.map(call=>call[2]),['PageView','AddToCart']);
    assert.equal(received[1][3].value,25);
    assert.deepEqual(received[1][3].content_ids,['1']);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
