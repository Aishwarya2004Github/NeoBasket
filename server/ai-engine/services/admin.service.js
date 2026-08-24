const { getRecentOrderCount } = require('../lib/ai-data');
const { inventoryIntelligence } = require('./forecast.service');

async function commandCenter() {
  const [ordersToday, inventory] = await Promise.all([getRecentOrderCount(24), inventoryIntelligence()]);
  const critical = inventory.filter(x => x.risk === 'CRITICAL').slice(0, 10);
  const warning = inventory.filter(x => x.risk === 'WARNING').slice(0, 10);
  const healthy = inventory.filter(x => x.risk === 'HEALTHY').slice(0, 5);
  const recommendations = critical.slice(0, 5).map(x => ({ action: `Replenish ${x.name}`, quantity: x.recommendedReorder, priority: 'HIGH' }));
  return { ordersToday, inventoryRiskCount: critical.length + warning.length, critical, warning, healthy, recommendations };
}

module.exports = { commandCenter };
