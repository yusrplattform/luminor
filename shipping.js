(function (root) {
  'use strict';
  function calculate(products, country, settings) {
    if (!products.length) return { lines: ['اختاري منتجًا واحدًا على الأقل.'] };
    const lines = [];
    let subtotal = 0, oil = 0, regular = 0, missing = false;
    for (const product of products) {
      const match = product.match(/ - (\d+)\.(\d{3}) ر\.ع/);
      const item = settings[product];
      if (!match) { missing = true; lines.push(product + ' — السعر غير متوفر.'); continue; }
      subtotal += Number(match[1]) * 1000 + Number(match[2]);
      if (!item || !Number.isSafeInteger(item.weightGrams) || item.weightGrams <= 0 || !['oil', 'regular'].includes(item.shippingClass)) {
        missing = true;
        lines.push(product + ' — الوزن أو تصنيف الشحن غير مؤكد.');
      } else {
        if (item.shippingClass === 'oil') oil += item.weightGrams; else regular += item.weightGrams;
        lines.push(product + ' — ' + item.weightGrams + ' جم، ' + (item.shippingClass === 'oil' ? 'زيتي' : 'غير زيتي'));
      }
    }
    const money = (baisa) => Math.floor(baisa / 1000) + '.' + String(baisa % 1000).padStart(3, '0') + ' ر.ع';
    lines.push('مجموع المنتجات: ' + money(subtotal));
    if (!country) lines.push('اختاري دولة التوصيل لتحديد الشحن.');
    else if (country === 'other') lines.push('الشحن والإجمالي بانتظار تأكيد خدمة العملاء؛ لا يُعرض سعر تقديري.');
    else if (!['OM', 'SA', 'AE', 'BH', 'QA', 'KW'].includes(country)) lines.push('دولة التوصيل غير صالحة.');
    else if (missing) lines.push('يتعذر حساب الشحن والإجمالي قبل تأكيد أوزان المنتجات وتصنيفاتها.');
    else {
      const regularCost = regular * 7, oilCost = oil * 9;
      lines.push('شحن غير الزيت: ' + regular + ' جم × ٧ ر.ع/كجم = ' + money(regularCost));
      lines.push('شحن الزيوت: ' + oil + ' جم × ٩ ر.ع/كجم = ' + money(oilCost));
      lines.push('الإجمالي: ' + money(subtotal + regularCost + oilCost));
    }
    lines.push('الشحن لا يشمل الجمارك أو الضرائب أو رسوم الاستيراد.');
    return { lines };
  }
  root.LuminorShipping = { calculate };
  if (typeof module !== 'undefined') module.exports = { calculate };
})(typeof window === 'undefined' ? globalThis : window);
