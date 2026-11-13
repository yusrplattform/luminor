(function () {
  'use strict';
  if (window.LuminorMarketing) return;
  const KEY = 'luminor-marketing-consent-v1', PIXEL = '1754919566679769';
  let choice = null, initialized = false, lastPage = null;
  try { choice = localStorage.getItem(KEY); } catch (_) {}
  function safePage() {
    const path = location.pathname;
    return !location.search && !location.hash && !/(^|\/)checkout(?:\.html|\/|$)/.test(path);
  }
  function allowed() { return choice === 'accepted' && safePage(); }
  function load() {
    if (!allowed() || initialized) return;
    initialized = true;
    const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    fbq('set', 'autoConfig', false, PIXEL);
    fbq('init', PIXEL);
    const tag = document.createElement('script'); tag.async = true; tag.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(tag);
  }
  function track(name) {
    if (!allowed() || !['PageView','ViewContent','AddToCart','InitiateCheckout'].includes(name)) return;
    load(); window.fbq('trackSingle', PIXEL, name);
  }
  function page() {
    if (!allowed()) return;
    const path = location.pathname;
    if (lastPage === path) return;
    lastPage = path; track('PageView');
    if (/\/products\/[^/]+\/?$/.test(path)) track('ViewContent');
  }
  function choose(value) {
    try { localStorage.setItem(KEY, value); } catch (_) { value = 'rejected'; }
    choice = value;
    if (banner) banner.hidden = true;
    updateSettings();
    if (value === 'accepted') { lastPage = null; page(); }
    else if (initialized) location.reload();
  }
  function button(text, fn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.addEventListener('click', fn); return b; }
  const banner = document.createElement('aside'); banner.className = 'marketing-consent'; banner.setAttribute('aria-label', 'اختيار التتبع التسويقي'); banner.hidden = choice === 'accepted' || choice === 'rejected';
  const text = document.createElement('p'); text.textContent = 'نستخدم Meta Pixel بموافقتك فقط لقياس التفاعل مع المتجر وتحسين الإعلانات. يمكنك الرفض أو تغيير اختيارك لاحقاً من الخصوصية. لا يؤثر اختيارك على الطلب.';
  banner.append(text, button('قبول التتبع التسويقي', () => choose('accepted')), button('رفض التتبع التسويقي', () => choose('rejected')));
  const policy = document.createElement('a'); policy.href = location.pathname.endsWith('.html') || document.querySelector('#privacy-policy') ? 'index.html#privacy-policy' : '/privacy'; policy.textContent = 'الخصوصية'; banner.appendChild(policy);
  policy.addEventListener('click', event => {
    if (!document.querySelector('#privacy-policy')) return;
    const link = document.querySelector('a[data-policy="privacy-policy"]');
    if (link) { event.preventDefault(); link.click(); }
  });
  document.body.appendChild(banner);
  function updateSettings() {
    document.querySelectorAll('[data-marketing-settings]').forEach(node => {
      node.replaceChildren();
      const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = choice === 'accepted' ? 'التتبع التسويقي مقبول حالياً.' : 'التتبع التسويقي مرفوض أو لم تتم الموافقة عليه.';
      node.append(status, button('قبول التتبع التسويقي', () => choose('accepted')), button('رفض التتبع التسويقي وسحب الموافقة', () => choose('rejected')));
    });
  }
  window.LuminorMarketing = { track, page, updateSettings };
  window.addEventListener('storage', event => { if (event.key === KEY) location.reload(); });
  updateSettings(); page();
})();
