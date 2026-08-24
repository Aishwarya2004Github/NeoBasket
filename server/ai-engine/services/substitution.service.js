const { getProducts } = require('../lib/ai-data');

function similarity(a, b) {
  let score = 0;
  if (a.category === b.category) score += 45;
  if (a.subCategory === b.subCategory) score += 20;
  const priceGap = Math.abs(a.sellingPrice - b.sellingPrice) / Math.max(1, a.sellingPrice);
  score += Math.max(0, 25 - priceGap * 25);
  if (a.unit && b.unit && a.unit === b.unit) score += 10;
  return Math.round(Math.min(99, score));
}

async function substitutes(productId) {
  const products = await getProducts({ limit: 500 });
  const original = products.find(p => p.id === productId);
  if (!original) return null;
  return {
    original,
    alternatives: products.filter(p => p.id !== productId && p.stock > 0).map(p => ({ ...p, similarity: similarity(original, p) })).sort((a, b) => b.similarity - a.similarity).slice(0, 6)
  };
}

module.exports = { substitutes };
