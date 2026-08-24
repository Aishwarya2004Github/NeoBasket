const { getProducts, getUserHistory } = require('../lib/ai-data');

async function recommendations(userId, limit = 8) {
  const [products, history] = await Promise.all([getProducts({ limit: 500 }), getUserHistory(userId, 100)]);
  const counts = new Map();
  for (const h of history) counts.set(h.productId, (counts.get(h.productId) || 0) + h.quantity);
  const purchased = new Set(history.map(h => h.productId));
  return products
    .filter(p => p.stock > 0)
    .map(p => ({ ...p, score: (counts.get(p.id) || 0) * 5 + (p.stock > 5 ? 2 : 0) + (p.discount || 0) / 10 }))
    .sort((a, b) => b.score - a.score)
    .filter(p => !purchased.has(p.id))
    .slice(0, limit)
    .map(({ score, ...p }) => ({ ...p, reason: 'Matches your purchase patterns, availability and value.' }));
}

async function forgotSomething(userId, cartProductIds = []) {
  const history = await getUserHistory(userId, 200);
  const cart = new Set(cartProductIds);
  const pairs = new Map();
  const ordersByDate = new Map();
  for (const h of history) {
    const key = new Date(h.createdAt).toISOString().slice(0, 10);
    if (!ordersByDate.has(key)) ordersByDate.set(key, new Set());
    ordersByDate.get(key).add(h.productId);
  }
  for (const set of ordersByDate.values()) {
    const ids = [...set];
    for (const a of ids) for (const b of ids) if (a !== b) {
      const key = `${a}:${b}`;
      pairs.set(key, (pairs.get(key) || 0) + 1);
    }
  }
  const suggestions = [];
  for (const [key, count] of pairs.entries()) {
    if (count < 2) continue;
    const [a, b] = key.split(':');
    if (cart.has(a) && !cart.has(b)) suggestions.push({ productId: b, confidence: Math.min(99, 60 + count * 5), reason: 'You often buy this with an item already in your cart.' });
  }
  return suggestions.slice(0, 5);
}

module.exports = { recommendations, forgotSomething };
