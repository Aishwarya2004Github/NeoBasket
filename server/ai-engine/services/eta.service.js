const { clamp } = require('../lib/math');

function predictEta({ distanceKm = 2, traffic = 0.4, weather = 0, prepMinutes = 5, riderLoad = 0.2, timeOfDay = new Date().getHours() }) {
  const baseSpeed = timeOfDay >= 18 && timeOfDay <= 21 ? 16 : 22;
  const trafficFactor = clamp(1 + traffic * 1.2, 1, 2.2);
  const weatherFactor = clamp(1 + Math.max(0, weather) * 0.5, 1, 1.5);
  const riderFactor = 1 + clamp(riderLoad, 0, 1) * 0.3;
  const travel = (distanceKm / baseSpeed) * 60 * trafficFactor * weatherFactor * riderFactor;
  const low = Math.max(3, Math.round(prepMinutes + travel));
  const high = Math.max(low + 2, Math.round(low * 1.35));
  return { lowMinutes: low, highMinutes: high, etaText: `${low}-${high} minutes`, factors: { distanceKm, traffic, weather, prepMinutes, riderLoad, timeOfDay } };
}

module.exports = { predictEta };
