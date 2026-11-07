(function (root) {
  'use strict';
  function calculate(products, country, settings) {
    if (!products.length) return { lines: ['اختاري منتجًا واحدًا على الأقل.'] };
    const lines = [];
    let subtotal = 0, missingPrice = false;
    for (const product of products) {
      const match = product.match(/ - (\d+)\.(\d{3}) ر\.ع/);
      if (!match) { missingPrice = true; lines.push(product + ' — السعر غير متوفر.'); continue; }
      subtotal += Number(match[1]) * 1000 + Number(match[2]);
      lines.push(product);
    }
    const money = (baisa) => Math.floor(baisa / 1000) + '.' + String(baisa % 1000).padStart(3, '0') + ' ر.ع';
    lines.push(missingPrice ? 'مجموع المنتجات غير متوفر حتى تأكيد الأسعار.' : 'إجمالي المنتجات فقط: ' + money(subtotal));
    if (!country) lines.push('اختاري دولة التوصيل لتحديد الشحن.');
    else if (country === 'other') lines.push('تكلفة الشحن لهذه الدولة والإجمالي النهائي يُؤكدان عبر واتساب.');
    else if (!['OM', 'SA', 'AE', 'BH', 'QA', 'KW'].includes(country)) lines.push('دولة التوصيل غير صالحة.');
    else {
      lines.push('أسعار الشحن لدول الخليج لكل كيلوجرام: ٧ ر.ع للمنتجات غير الزيتية، و٩ ر.ع للزيوت، حسب الوزن الفعلي.');
      lines.push('تكلفة الشحن والإجمالي النهائي يُؤكدان مع خدمة العملاء عبر واتساب.');
    }
    lines.push('الشحن لا يشمل الجمارك أو الضرائب أو رسوم الاستيراد.');
    return { lines };
  }
  root.LuminorShipping = { calculate };
  if (typeof module !== 'undefined') module.exports = { calculate };
})(typeof window === 'undefined' ? globalThis : window);
