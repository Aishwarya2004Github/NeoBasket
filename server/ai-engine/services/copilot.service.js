const { getProducts, getUserHistory } = require('../lib/ai-data');
const { askJson } = require('../lib/openai');
const { roundMoney } = require('../lib/math');

function extractConstraints(text) {
  const value = String(text || '');
  const budgetMatch = value.match(/(?:under|below|within|budget(?: of)?)\s*[₹rs. ]*([0-9,]+)/i);
  const peopleMatch = value.match(/([0-9]+)\s*(?:people|persons|members)/i);
  const daysMatch = value.match(/([0-9]+)\s*days?/i);
  return {
    budget: budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) : 1500,
    people: peopleMatch ? Number(peopleMatch[1]) : 2,
    days: daysMatch ? Number(daysMatch[1]) : 3
  };
}

function scoreProduct(product, wanted, historyNames) {
  const text = `${product.name} ${product.category} ${product.subCategory} ${product.description}`.toLowerCase();
  let score = 0;
  for (const token of wanted) if (text.includes(token)) score += 4;
  if (product.stock > 0) score += 2;
  if (historyNames.has(product.name.toLowerCase())) score += 3;
  if (product.sellingPrice <= 200) score += 1;
  return score;
}

function fallbackBasket(products, history, constraints) {
  const historyNames = new Set(history.map(h => h.productName.toLowerCase()));
  const wanted = String(constraints.message || '').toLowerCase().split(/[^a-z0-9]+/).filter(x => x.length > 2);
  const ranked = products
    .filter(p => p.stock > 0)
    .map(p => ({ ...p, score: scoreProduct(p, wanted, historyNames) }))
    .sort((a, b) => b.score - a.score || a.sellingPrice - b.sellingPrice);

  const targetCount = Math.max(5, Math.min(12, Math.ceil(constraints.people * constraints.days / 2)));
  const basket = [];
  let total = 0;

  for (const product of ranked) {
    if (basket.length >= targetCount) break;
    const quantity = product.stock > 0 ? 1 : 0;
    if (!quantity) continue;
    if (total + product.sellingPrice <= constraints.budget) {
      basket.push({ productId: product.id, name: product.name, unit: product.unit, quantity, unitPrice: product.sellingPrice, subtotal: product.sellingPrice });
      total += product.sellingPrice;
    }
  }

  return { basket, total: roundMoney(total) };
}

async function createCopilotBasket({ message, userId }) {
  const constraints = { message, ...extractConstraints(message) };
  const [products, history] = await Promise.all([getProducts({ limit: 500 }), getUserHistory(userId, 100)]);

  const ai = await askJson(
    'You are a grocery shopping planner. Return JSON with keys: productNames (array of product names), quantities (object keyed by exact product name), priorities (array), explanation (string). Never invent products outside the supplied catalog.',
    JSON.stringify({ request: message, constraints, history: history.slice(0, 30), catalog: products.map(p => ({ id: p.id, name: p.name, category: p.category, subCategory: p.subCategory, price: p.sellingPrice, stock: p.stock, unit: p.unit })) })
  ).catch(() => null);

  let basket = [];
  if (ai?.productNames?.length) {
    const byName = new Map(products.map(p => [p.name.toLowerCase(), p]));
    for (const name of ai.productNames) {
      const p = byName.get(String(name).toLowerCase());
      if (!p || p.stock <= 0) continue;
      const quantity = Math.min(Number(ai.quantities?.[name] || 1), p.stock);
      const subtotal = roundMoney(p.sellingPrice * quantity);
      if (basket.reduce((s, x) => s + x.subtotal, 0) + subtotal <= constraints.budget) {
        basket.push({ productId: p.id, name: p.name, unit: p.unit, quantity, unitPrice: p.sellingPrice, subtotal });
      }
    }
  }

  if (!basket.length) basket = fallbackBasket(products, history, constraints).basket;
  const total = roundMoney(basket.reduce((s, x) => s + x.subtotal, 0));
  const originalCatalogTotal = roundMoney(basket.reduce((s, x) => s + (products.find(p => p.id === x.productId)?.price || x.unitPrice) * x.quantity, 0));
  const saving = roundMoney(Math.max(0, originalCatalogTotal - total));

  const alternatives = products
    .filter(p => p.stock > 0 && !basket.some(b => b.productId === p.id))
    .sort((a, b) => a.sellingPrice - b.sellingPrice)
    .slice(0, 5)
    .map(p => ({ productId: p.id, name: p.name, price: p.sellingPrice, stock: p.stock }));

  return {
    request: message,
    constraints,
    basket,
    total,
    saving,
    remainingBudget: roundMoney(constraints.budget - total),
    alternatives,
    historyUsed: history.length > 0,
    explanation: ai?.explanation || 'Basket optimized using availability, price and your purchase history when available.'
  };
}

module.exports = { createCopilotBasket };
