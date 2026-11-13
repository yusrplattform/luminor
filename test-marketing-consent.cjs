const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('marketing-consent.js', 'utf8');

function setup(initial, path = '/', search = '') {
  const saved = new Map(initial ? [['luminor-marketing-consent-v1', initial]] : []);
  const requests = [], elements = [];
  function element(tag) {
    return { tag, children: [], hidden: false, addEventListener(type, callback) { this[type] = callback; }, setAttribute() {}, append(...items) { this.children.push(...items); }, appendChild(item) { this.children.push(item); }, replaceChildren() { this.children = []; } };
  }
  const location = { pathname: path, search, hash: '', reload() { this.reloaded = true; } };
  const document = { head: { appendChild(tag) { requests.push(tag.src); } }, body: { appendChild(item) { elements.push(item); } }, createElement: element, querySelector() { return null; }, querySelectorAll() { return []; } };
  const localStorage = { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) };
  const window = { addEventListener() {} };
  vm.runInNewContext(source, {window, document, localStorage, location});
  return {window, location, requests, banner: elements[0]};
}
function events(env) { return Array.from(env.window.fbq.queue).filter(call => call[0] === 'trackSingle').map(call => call[2]); }

const fresh = setup();
fresh.window.LuminorMarketing.track('AddToCart');
assert.equal(fresh.requests.length, 0);
fresh.banner.children[2].click();
fresh.window.LuminorMarketing.track('InitiateCheckout');
assert.equal(fresh.requests.length, 0);

const accepted = setup(null, '/products/1');
accepted.banner.children[1].click();
assert.equal(accepted.requests.length, 1);
assert.deepEqual(events(accepted), ['PageView', 'ViewContent']);
accepted.window.LuminorMarketing.page();
assert.deepEqual(events(accepted), ['PageView', 'ViewContent']);
accepted.window.LuminorMarketing.track('AddToCart');
accepted.window.LuminorMarketing.track('Purchase');
assert.deepEqual(events(accepted), ['PageView', 'ViewContent', 'AddToCart']);
accepted.banner.children[2].click();
assert.equal(accepted.location.reloaded, true);
accepted.window.LuminorMarketing.track('InitiateCheckout');
assert.equal(events(accepted).length, 3);

const privatePage = setup('accepted', '/checkout/return');
privatePage.window.LuminorMarketing.track('PageView');
assert.equal(privatePage.requests.length, 0);
const queryPage = setup('accepted', '/products/1', '?private=value');
queryPage.window.LuminorMarketing.track('AddToCart');
assert.equal(queryPage.requests.length, 0);
console.log('Marketing consent and event checks passed');
