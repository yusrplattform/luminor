(function () {
  'use strict';
  if (window.LuminorMarketing) return;
  // A new consent choice is required because Google is an additional recipient.
  const KEY = 'luminor-marketing-consent-v2';
  const GOOGLE_TAG = 'GTM-PRDPLZK8';
  const configuredPixel = document.currentScript?.dataset.pixelId || '1754919566679769';
  const PIXEL = /^\d+$/.test(configuredPixel) ? configuredPixel : '';
  let choice = null, initialized = false, googleInitialized = false, lastPage = null;
  try { choice = localStorage.getItem(KEY); } catch (_) {}
  function sanitizeCampaignUrl() {
    if (!hasConsent() || !location.search || /(^|\/)checkout(?:\.html|\/|$)/.test(location.pathname)) return;
    const params = new URLSearchParams(location.search);
    const known = new Set(['fbclid','utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid','_dbg','gtm_debug']);
    if ([...params.keys()].every(key => known.has(key))) {
      const googleClicks = new URLSearchParams();
      for (const key of ['gclid','gbraid','wbraid','_dbg','gtm_debug']) for (const value of params.getAll(key)) {
        if (/^[a-zA-Z0-9._~-]{1,512}$/.test(value)) googleClicks.append(key, value);
      }
      const search = googleClicks.toString();
      window.history.replaceState(window.history.state, '', location.pathname + (search ? '?' + search : '') + location.hash);
    }
  }
  function safePage() {
    const path = location.pathname;
    const safeHash = !location.hash || (path === '/shop' && ['#bundles','#hair','#body','#frankincense'].includes(location.hash));
    return !location.search && safeHash && !/(^|\/)checkout(?:\.html|\/|$)/.test(path);
  }
  function hasConsent() { try { return choice === 'accepted' && localStorage.getItem(KEY) === 'accepted'; } catch (_) { return false; } }
  function allowed() { return !!PIXEL && hasConsent() && safePage(); }
  function loadGoogle() {
    const safeHash = !location.hash || (location.pathname === '/shop' && ['#bundles','#hair','#body','#frankincense'].includes(location.hash));
    const params = new URLSearchParams(location.search);
    const safeQuery = [...params.entries()].every(([key,value]) => ['gclid','gbraid','wbraid','_dbg','gtm_debug'].includes(key) && /^[a-zA-Z0-9._~-]{1,512}$/.test(value));
    if (googleInitialized || !hasConsent() || !safeHash || !safeQuery || /(^|\/)checkout(?:\.html|\/|$)/.test(location.pathname)) return;
    googleInitialized = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied'});
    window.gtag('consent', 'update', {ad_storage:'granted'});
    window.gtag('js', new Date());
    window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
    const tag = document.createElement('script'); tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtm.js?id=' + GOOGLE_TAG;
    document.head.appendChild(tag);
  }
  function load(purchasePage = false) {
    if ((!allowed() && !purchasePage) || !PIXEL || !hasConsent() || initialized) return;
    initialized = true;
    const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
    fbq('set', 'autoConfig', false, PIXEL);
    fbq('init', PIXEL);
    const tag = document.createElement('script'); tag.async = true; tag.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(tag);
  }
  function cleanDetails(details) {
    if (!details || !Array.isArray(details.content_ids) || !details.content_ids.length || !details.content_ids.every(id => typeof id === 'string' && /^\d+$/.test(id)) || !Number.isFinite(details.value) || details.value < 0 || details.currency !== 'OMR') return null;
    return {content_ids: details.content_ids, content_type: 'product', value: details.value, currency: 'OMR'};
  }
  function track(name, details) {
    if (!allowed() || !['PageView','ViewContent','AddToCart','InitiateCheckout'].includes(name)) return;
    const clean = details && cleanDetails(details);
    if (details && !clean) return;
    load(); window.fbq('trackSingle', PIXEL, name, clean || {});
  }
  function purchase(details, eventID) {
    const clean = cleanDetails(details);
    if (!PIXEL || !hasConsent() || location.pathname !== '/checkout/return' || location.search || location.hash || !clean || !/^[a-f0-9]{64}$/.test(eventID)) return false;
    load(true);
    window.fbq('trackSingle', PIXEL, 'Purchase', clean, {eventID});
    return true;
  }
  function page() {
    sanitizeCampaignUrl();
    loadGoogle();
    if (!allowed()) { lastPage = null; return; }
    const path = location.pathname;
    if (lastPage === path) return;
    lastPage = path; track('PageView');
    if (/\/products\/[^/]+\/?$/.test(path)) track('ViewContent');
  }
  function choose(value) {
    const previous = choice;
    try { localStorage.setItem(KEY, value); } catch (_) { value = 'rejected'; }
    choice = value;
    if (banner) banner.hidden = true;
    updateSettings();
    window.dispatchEvent(new Event('luminor-marketing-consent-change'));
    if (value === 'accepted' && previous !== 'accepted') { lastPage = null; page(); }
    else if (value !== 'accepted' && (initialized || googleInitialized)) location.reload();
  }
  function button(text, fn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.addEventListener('click', fn); return b; }
  const banner = document.createElement('aside'); banner.className = 'marketing-consent'; banner.setAttribute('aria-label', 'اختيارات ملفات تعريف الارتباط'); banner.hidden = choice === 'accepted' || choice === 'rejected';
  const text = document.createElement('p'); text.textContent = 'نستخدم ملفات تعريف الارتباط التسويقية لقياس تفاعلك مع المتجر وتحسين إعلاناتنا. يمكنك تغيير اختيارك في أي وقت من صفحة الخصوصية.';
  banner.append(text, button('قبول الكوكيز التسويقية', () => choose('accepted')), button('رفض الكوكيز التسويقية', () => choose('rejected')));
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
  window.LuminorMarketing = { track, page, updateSettings, purchase, hasConsent };
  window.dispatchEvent(new Event('luminor-marketing-ready'));
  window.addEventListener('storage', event => { if (event.key === KEY) location.reload(); });
  updateSettings(); page();
})();
