const prisma = require('../config/prisma');
const { discountedPrice, daysBetween } = require('./math');

async function getProducts({ search, limit = 100 } = {}) {
  const where = { publish: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true, subCategory: true },
    orderBy: { createdAt: 'desc' },
    take: Math.min(Number(limit) || 100, 500)
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price || 0),
    discount: Number(p.discount || 0),
    sellingPrice: discountedPrice(p),
    stock: Number(p.stock || 0),
    unit: p.unit || '',
    description: p.description || '',
    categoryId: p.categoryId,
    category: p.category?.name || '',
    subCategory: p.subCategory?.name || '',
    image: Array.isArray(p.image) ? p.image[0] : null,
    details: p.more_details || {}
  }));
}

async function getUserHistory(userId, take = 100) {
  if (!userId) return [];
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
    take
  });

  return orders.map(o => ({
    orderId: o.orderId,
    productId: o.productId,
    productName: o.product?.name || o.product_name || '',
    quantity: Number(o.quantity || 1),
    price: Number(o.subTotalAmt || o.totalAmt || 0),
    status: o.status,
    createdAt: o.createdAt
  }));
}

async function getSalesHistory(productId, days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const orders = await prisma.order.findMany({
    where: { productId, createdAt: { gte: since } },
    select: { quantity: true, createdAt: true, subTotalAmt: true }
  });

  const buckets = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 86400000);
    d.setHours(0, 0, 0, 0);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const o of orders) {
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) || 0) + Number(o.quantity || 0));
  }

  return Array.from(buckets.entries()).map(([date, quantity], index) => ({
    date,
    quantity,
    x: index
  }));
}

async function getRecentOrderCount(hours = 24) {
  const since = new Date(Date.now() - hours * 3600000);
  return prisma.order.count({ where: { createdAt: { gte: since } } });
}

async function getInventoryRisk() {
  const products = await prisma.product.findMany({
    where: { publish: true },
    include: { category: true },
    take: 500
  });

  const results = [];
  for (const product of products) {
    const history = await getSalesHistory(product.id, 14);
    const total = history.reduce((s, x) => s + x.quantity, 0);
    const daily = total / 14;
    const stock = Number(product.stock || 0);
    const daysLeft = daily > 0 ? stock / daily : Infinity;
    results.push({
      productId: product.id,
      name: product.name,
      stock,
      avgDailySales: Number(daily.toFixed(2)),
      daysLeft: Number.isFinite(daysLeft) ? Number(daysLeft.toFixed(2)) : null,
      risk: daysLeft <= 1 ? 'CRITICAL' : daysLeft <= 3 ? 'WARNING' : 'HEALTHY'
    });
  }
  return results.sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999));
}

module.exports = { getProducts, getUserHistory, getSalesHistory, getRecentOrderCount, getInventoryRisk, daysBetween };
