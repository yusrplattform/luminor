(function (root) {
  'use strict';
  function calculate(products, country, settings) {
    if (!products.length) return { lines: ['اختاري منتجًا واحدًا على الأقل.'] };
    const lines = [];
    let subtotal = 0, weightGrams = 0, hasOil = false, missingPrice = false, missingShipping = false;
    for (const product of products) {
      const match = product.match(/ - (\d+)\.(\d{3}) ر\.ع/);
      if (!match) { missingPrice = true; lines.push(product + ' — السعر غير متوفر.'); continue; }
      subtotal += Number(match[1]) * 1000 + Number(match[2]);
      const item = settings && settings[product];
      if (!item || !['oil', 'regular'].includes(item.shippingClass) || !Number.isInteger(item.weightGrams) || item.weightGrams <= 0) missingShipping = true;
      else { weightGrams += item.weightGrams; if (item.shippingClass === 'oil') hasOil = true; }
      lines.push(product);
    }
    const money = (baisa) => Math.floor(baisa / 1000) + '.' + String(baisa % 1000).padStart(3, '0') + ' ر.ع';
    lines.push(missingPrice ? 'مجموع المنتجات غير متوفر حتى تأكيد الأسعار.' : 'إجمالي المنتجات فقط: ' + money(subtotal));
    if (!country) lines.push('اختاري دولة التوصيل لتحديد الشحن.');
    else if (country === 'other') lines.push('تكلفة الشحن لهذه الدولة والإجمالي النهائي يُؤكدان عبر واتساب.');
    else if (!['OM', 'SA', 'AE', 'BH', 'QA', 'KW'].includes(country)) lines.push('دولة التوصيل غير صالحة.');
    else {
      lines.push('يُحتسب وزن الشحن التقديري ٥٠٠ جرام لكل قطعة: ٧ ر.ع/كجم، أو ٩ ر.ع/كجم للطلب كاملًا إذا احتوى على زيت.');
      if (missingShipping) lines.push('تكلفة الشحن غير متوفرة حتى تأكيد تفاصيل المنتجات.');
      else {
        const shipping = weightGrams * (hasOil ? 9 : 7);
        lines.push('تكلفة الشحن: ' + money(shipping));
        if (!missingPrice) lines.push('الإجمالي شامل الشحن: ' + money(subtotal + shipping));
      }
    }
    lines.push('الشحن لا يشمل الجمارك أو الضرائب أو رسوم الاستيراد.');
    return { lines };
  }
  root.LuminorShipping = { calculate };
  if (typeof module !== 'undefined') module.exports = { calculate };
})(typeof window === 'undefined' ? globalThis : window);
