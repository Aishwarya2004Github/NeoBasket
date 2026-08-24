const { analyzeImage } = require('../lib/openai');
const { recipesFromIngredients } = require('./recipe.service');

async function scanFridge(imageBase64) {
  const result = await analyzeImage(imageBase64, 'Identify visible food/grocery items. Return {"items":[{"name":"...","confidence":0.0}]}');
  const items = Array.isArray(result?.items) ? result.items : [];
  const recipes = await recipesFromIngredients(items.map(x => x.name));
  return { items, recipes, aiEnabled: Boolean(result) };
}

module.exports = { scanFridge };
