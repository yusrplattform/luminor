// يُحتسب الشحن مؤقتًا على أساس 500 جرام لكل قطعة، بحسب التصنيف.
const LUMINOR_SHIPPING = {
  "بكج العناية LUMINOR (خلطة التكثيف والنمو، زيت، تونر، ماسك الترطيب العميق) - 25.000 ر.ع": {
    "weightGrams": 2000,
    "shippingClass": "oil"
  },
  "خلطة النمو والتكثيف LUMINOR - 12.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "تونر بخاخ LUMINOR - 2.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "ماسك الترطيب العميق LUMINOR - 8.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "مشط LUMINOR - 3.500 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "سدر LUMINOR - 4.500 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "مشاط LUMINOR - 6.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "الحنا العماني LUMINOR - 3.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "الحنا بالأعشاب LUMINOR - 8.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "زيت الشعر LUMINOR - 8.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "oil"
  },
  "ماسك الشعر LUMINOR - 7.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "دالفور LUMINOR - 8.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "الورس اليمني LUMINOR - 7.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "سنفرة الجسم LUMINOR - 8.500 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "صابونية الجسم LUMINOR - 8.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "كريم التفتيح LUMINOR - 10.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "لبان LUMINOR 100 جرام - 2.400 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "لبان LUMINOR 250 جرام - 6.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "لبان LUMINOR 500 جرام - 12.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  },
  "لبان LUMINOR 1 كيلو - 24.000 ر.ع": {
    "weightGrams": 500,
    "shippingClass": "regular"
  }
};
if (typeof window !== 'undefined') window.LUMINOR_SHIPPING = LUMINOR_SHIPPING;
if (typeof module !== 'undefined') module.exports = LUMINOR_SHIPPING;
