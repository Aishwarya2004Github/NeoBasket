const { getUserHistory } = require("../lib/ai-data");
const { daysBetween } = require("../lib/math");

/**
 * Smart Refill
 *
 * User ke previous delivered/ordered products ko analyze karke
 * next refill prediction karta hai.
 */
async function smartRefill(userId) {
    if (!userId) {
        throw new Error("User ID is required for smart refill.");
    }

    const history = await getUserHistory(userId, 300);

    if (!Array.isArray(history) || history.length === 0) {
        return [];
    }

    const groups = new Map();

    for (const item of history) {
        if (!item.productId) {
            continue;
        }

        if (!groups.has(item.productId)) {
            groups.set(item.productId, []);
        }

        groups.get(item.productId).push(item);
    }

    const result = [];

    for (const [productId, items] of groups.entries()) {
        if (!items.length) {
            continue;
        }

        const dates = items
            .map((item) => new Date(item.createdAt))
            .filter((date) => !Number.isNaN(date.getTime()))
            .sort((a, b) => b.getTime() - a.getTime());

        if (!dates.length) {
            continue;
        }

        const intervals = [];

        for (let i = 1; i < dates.length; i++) {
            const interval = daysBetween(
                dates[i],
                dates[i - 1]
            );

            if (
                Number.isFinite(interval) &&
                interval >= 0
            ) {
                intervals.push(interval);
            }
        }

        /*
         * Agar repeat purchase nahi hai,
         * default interval 7 days.
         */
        const avgInterval =
            intervals.length > 0
                ? intervals.reduce(
                      (sum, value) => sum + value,
                      0
                  ) / intervals.length
                : 7;

        const sinceLast = daysBetween(
            dates[0]
        );

        const daysUntil = Math.max(
            0,
            avgInterval - sinceLast
        );

        /*
         * More purchase history = higher confidence.
         */
        const confidence = Math.min(
            0.99,
            0.55 + intervals.length * 0.05
        );

        const productName =
            items.find(
                (item) => item.productName
            )?.productName ||
            "Unknown Product";

        const productImage =
            items.find(
                (item) => item.productImage
            )?.productImage ||
            null;

        result.push({
            productId,

            productName,

            productImage,

            averageIntervalDays:
                Number(
                    avgInterval.toFixed(1)
                ),

            daysSinceLastPurchase:
                Number(
                    sinceLast.toFixed(1)
                ),

            predictedNextPurchaseInDays:
                Number(
                    daysUntil.toFixed(1)
                ),

            needsRefill:
                sinceLast >=
                avgInterval * 0.9,

            confidence:
                Number(
                    confidence.toFixed(2)
                ),

            purchaseCount: dates.length,
        });
    }

    return result.sort(
        (a, b) =>
            a.predictedNextPurchaseInDays -
            b.predictedNextPurchaseInDays
    );
}

module.exports = {
    smartRefill,
};