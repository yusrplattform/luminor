(function () {
  'use strict';
  const key = 'luminor-selected-products';
  let products = [];
  try { const stored = JSON.parse(sessionStorage.getItem(key) || '[]'); if (Array.isArray(stored)) products = stored.filter(item => typeof item === 'string').map(item => item.replace(/ \/ \d+ ر\.س$/, '')); sessionStorage.setItem(key, JSON.stringify(products)); } catch (_) {}
  const form = document.getElementById('checkoutForm');
  const country = document.getElementById('deliveryCountry');
  const fields = ['otherCountry', 'customerName', 'customerPhone', 'customerAddress'];
  const items = document.getElementById('items');
  function updateShipping() {
    const result = window.LuminorShipping.calculate(products, country.value, window.LUMINOR_SHIPPING).lines;
    document.getElementById('shippingCost').textContent = result.find(line => line.startsWith('تكلفة الشحن')) || (country.value ? 'يُؤكد الشحن والإجمالي عبر واتساب.' : 'اختاري دولة التوصيل لعرض تكلفة الشحن.');
    document.getElementById('grandTotal').textContent = result.find(line => line.startsWith('الإجمالي شامل الشحن:')) || '';
  }
  function save() { try { sessionStorage.setItem(key, JSON.stringify(products)); } catch (_) {} }
  function render() {
    form.hidden = products.length === 0;
    document.getElementById('empty').hidden = products.length !== 0;
    items.replaceChildren();
    const counts = new Map();
    products.forEach(product => counts.set(product, (counts.get(product) || 0) + 1));
    counts.forEach((count, product) => {
      const parts = product.split(' - ');
      const row = document.createElement('div'); row.className = 'item';
      const info = document.createElement('div');
      const name = document.createElement('div'); name.className = 'item-name'; name.textContent = parts[0];
      const price = document.createElement('div'); price.className = 'item-price'; price.textContent = parts.slice(1).join(' - ') + ' للقطعة';
      info.append(name, price);
      const controls = document.createElement('div'); controls.className = 'item-controls';
      const label = document.createElement('label'); label.textContent = 'الكمية';
      const quantity = document.createElement('input'); quantity.type = 'number'; quantity.min = '1'; quantity.max = '99'; quantity.value = count; quantity.setAttribute('aria-label', 'كمية ' + parts[0]);
      quantity.addEventListener('change', () => {
        const n = Math.max(1, Math.min(99, Math.floor(Number(quantity.value)) || 1));
        const first = products.indexOf(product);
        products = products.filter(item => item !== product);
        products.splice(first, 0, ...Array(n).fill(product));
        save(); render();
      });
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = 'حذف'; remove.setAttribute('aria-label', 'حذف ' + parts[0]);
      remove.addEventListener('click', () => { products = products.filter(item => item !== product); save(); render(); });
      label.appendChild(quantity); controls.append(label, remove); row.append(info, controls); items.appendChild(row);
    });
    const totalLine = window.LuminorShipping.calculate(products, '', {}).lines.find(line => line.startsWith('إجمالي المنتجات فقط:') || line.startsWith('مجموع المنتجات غير متوفر'));
    document.getElementById('subtotal').textContent = totalLine ? totalLine.replace('إجمالي المنتجات فقط: ', '') : 'يُؤكد مع خدمة العملاء';
    updateShipping();
  }
  render();
  country.addEventListener('change', () => {
    const other = country.value === 'other';
    document.getElementById('otherDetails').hidden = !other;
    fields.forEach(id => { document.getElementById(id).required = other; });
    updateShipping();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!products.length) return;
    const counts = new Map(); products.forEach(product => counts.set(product, (counts.get(product) || 0) + 1));
    const summary = window.LuminorShipping.calculate(products, country.value, window.LUMINOR_SHIPPING).lines.filter(line => !products.some(product => line === product));
    const message = ['طلب جديد من LUMINOR', 'المنتجات المختارة:', ...Array.from(counts, ([product, count]) => '- ' + product + ' × ' + count), '', ...summary,
      'دولة التوصيل: ' + (country.value === 'other' ? document.getElementById('otherCountry').value.trim() : country.options[country.selectedIndex].text),
      ...(country.value === 'other' ? ['الاسم: ' + document.getElementById('customerName').value.trim(), 'رقم التواصل: ' + document.getElementById('customerPhone').value.trim(), 'العنوان: ' + document.getElementById('customerAddress').value.trim()] : []),
      'أرغب بتأكيد الطلب والتوصيل.',
      document.getElementById('marketingConsent').checked ? 'موافقة تسويقية اختيارية: أوافق على استقبال عروض LUMINOR عبر واتساب ويمكنني إلغاء الموافقة في أي وقت. تاريخ الموافقة: ' + new Date().toISOString() : 'لا أوافق على استقبال الرسائل التسويقية.'
    ].join('\n');
    window.location.href = 'https://api.whatsapp.com/send?phone=96898939222&text=' + encodeURIComponent(message);
  });
})();
