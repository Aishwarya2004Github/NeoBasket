function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function discountedPrice(product) {
  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);
  return roundMoney(price - (price * discount / 100));
}

function linearRegressionPredict(points, x) {
  if (!points || points.length < 2) return points?.[0]?.y || 0;
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (!denominator) return sumY / n;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return Math.max(0, slope * x + intercept);
}

function daysBetween(a, b = new Date()) {
  return Math.max(0, (new Date(b) - new Date(a)) / 86400000);
}

module.exports = { clamp, roundMoney, discountedPrice, linearRegressionPredict, daysBetween };
