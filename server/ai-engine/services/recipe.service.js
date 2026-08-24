const { getProducts } = require('../lib/ai-data');
const { askJson } = require('../lib/openai');

async function recipesFromIngredients(ingredients, budget = null) {
  const catalog = await getProducts({ limit: 500 });
  const ai = await askJson(
    'You are a recipe assistant for a grocery app. Return JSON with recipes array. Each recipe must contain name, ingredients, missingIngredients, steps, estimatedCost. Do not invent grocery products when avoidable.',
    JSON.stringify({ ingredients, budget, catalog: catalog.map(p => ({ id: p.id, name: p.name, price: p.sellingPrice })) })
  ).catch(() => null);
  if (ai?.recipes) return ai.recipes;

  const text = ingredients.map(x => String(x).toLowerCase());
  const result = [];
  if (text.some(x => x.includes('rice')) && text.some(x => x.includes('egg'))) result.push({ name: 'Egg Fried Rice', ingredients, missingIngredients: ['onion', 'green chilli'], steps: ['Cook rice', 'Scramble eggs', 'Stir-fry with vegetables', 'Mix rice and eggs'], estimatedCost: 120 });
  if (text.some(x => x.includes('paneer'))) result.push({ name: 'Paneer Masala', ingredients, missingIngredients: ['tomato', 'onion', 'spices'], steps: ['Prepare masala', 'Add paneer', 'Simmer'], estimatedCost: 180 });
  if (!result.length) result.push({ name: 'Quick Mixed Bowl', ingredients, missingIngredients: ['lemon', 'herbs'], steps: ['Chop ingredients', 'Mix and season', 'Serve'], estimatedCost: 100 });
  return result;
}

async function healthyBasket({ budget = 800, goals = [], vegetarian = true }) {
  const products = await getProducts({ limit: 500 });
  const ai = await askJson(
    'Select a healthy grocery basket from the supplied catalog. Return JSON with productIds array and reason. Respect budget and vegetarian flag. Never invent product ids.',
    JSON.stringify({ budget, goals, vegetarian, catalog: products.map(p => ({ id: p.id, name: p.name, price: p.sellingPrice, category: p.category, details: p.details })) })
  ).catch(() => null);
  const selected = ai?.productIds?.length ? products.filter(p => ai.productIds.includes(p.id) && p.stock > 0) : products.filter(p => p.stock > 0 && ['vegetables', 'fruits', 'milk', 'paneer', 'eggs'].some(k => `${p.name} ${p.category}`.toLowerCase().includes(k))).sort((a, b) => a.sellingPrice - b.sellingPrice);
  const basket = [];
  let total = 0;
  for (const p of selected) {
    if (total + p.sellingPrice <= budget) { basket.push({ productId: p.id, name: p.name, price: p.sellingPrice, quantity: 1 }); total += p.sellingPrice; }
  }
  return { goals, budget, basket, total, remaining: budget - total, reason: ai?.reason || 'Optimized for budget and common healthy-food categories.' };
}

module.exports = { recipesFromIngredients, healthyBasket };
