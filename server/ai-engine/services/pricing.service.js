const { getProducts, getSalesHistory } = require('../lib/ai-data');
const { clamp, roundMoney } = require('../lib/math');

const FESTIVAL_FACTORS = {
  diwali: 1.05, holi: 1.03, 'raksha bandhan': 1.02, eid: 1.04, christmas: 1.03,
  navratri: 1.02, 'ganesh chaturthi': 1.02, onam: 1.02, pongal: 1.02,
  'independence day': 1.01, 'republic day': 1.01
};

function seasonFactor(month) {
  if ([3,4,5].includes(month)) return 1.02;
  if ([11,0,1].includes(month)) return 1.01;
  return 1;
}

function festivalFactor(name) {
  const key = String(name || '').toLowerCase();
  return FESTIVAL_FACTORS[key] || 1;
}

async function dynamicPrice({ productId, festival = '', expiryDays = null, weatherScore = 0 }) {
  const products = await getProducts({ limit: 500 });
  const product = products.find(p => p.id === productId);
  if (!product) return null;
  const history = await getSalesHistory(productId, 14);
  const demand14 = history.reduce((s, x) => s + x.quantity, 0);
  const avgDaily = demand14 / 14;
  const demandFactor = clamp(1 + Math.min(0.06, avgDaily / 1000), 0.96, 1.06);
  const stockRatio = product.stock / Math.max(1, avgDaily * 7);
  const scarcityFactor = stockRatio < 0.5 ? 1.05 : stockRatio < 1 ? 1.03 : stockRatio > 3 ? 0.98 : 1;
  const expiryFactor = expiryDays != null && expiryDays <= 2 ? 0.90 : expiryDays != null && expiryDays <= 5 ? 0.95 : 1;
  const weatherFactor = weatherScore > 0.7 ? 1.02 : weatherScore < -0.7 ? 0.98 : 1;
  const now = new Date();
  const calculated = product.price * demandFactor * seasonFactor(now.getMonth()) * festivalFactor(festival) * scarcityFactor * expiryFactor * weatherFactor;
  const min = product.price * 0.90;
  const max = product.price * 1.10;
  const finalPrice = roundMoney(clamp(calculated, min, max));
  return {
    productId: product.id,
    productName: product.name,
    basePrice: product.price,
    finalPrice,
    minPrice: roundMoney(min),
    maxPrice: roundMoney(max),
    
    inventory: product.stock,
avgDailySales: Math.max(0, Math.round(avgDaily * 100)),
    reason: finalPrice > product.price ? 'Higher demand or lower stock increased price within the protection band.' : finalPrice < product.price ? 'Expiry/season/value signals reduced price within the protection band.' : 'No significant pricing adjustment.'
  };
}

module.exports = { dynamicPrice };
