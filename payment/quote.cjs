'use strict';

// The server derives the price and shipping from its own product catalogue.
const catalogue = require('../product-shipping.js');
const eligibleCountries = new Set(['OM', 'SA', 'AE', 'BH', 'QA', 'KW']);

function quote(items, country) {
  if (!eligibleCountries.has(country)) throw new Error('unsupported_country');
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) throw new Error('invalid_items');
  let subtotal = 0, weight = 0, hasOil = false;
  for (const item of items) {
    if (typeof item !== 'string' || !Object.hasOwn(catalogue, item)) throw new Error('unknown_product');
    const details = catalogue[item];
    const match = item.match(/ - (\d+)\.(\d{3}) ر\.ع$/);
    if (!match || !Number.isSafeInteger(details.weightGrams) || details.weightGrams <= 0 || !['oil', 'regular'].includes(details.shippingClass)) throw new Error('invalid_catalogue');
    subtotal += Number(match[1]) * 1000 + Number(match[2]);
    weight += details.weightGrams;
    hasOil ||= details.shippingClass === 'oil';
  }
  const shipping = weight * (hasOil ? 9 : 7);
  return { currency: 'OMR', subtotalBaisa: subtotal, shippingBaisa: shipping, totalBaisa: subtotal + shipping };
}
module.exports = { quote };
