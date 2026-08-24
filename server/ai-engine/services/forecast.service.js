const { getProducts, getSalesHistory } = require('../lib/ai-data');
const { linearRegressionPredict } = require('../lib/math');


/* =========================================================
   DEMAND FORECAST
========================================================= */

async function demandForecast(productId, horizon = 7) {

  const products = await getProducts({
    limit: 500
  });

  const product =
    products.find(
      p => String(p.id) === String(productId)
    );

  if (!product) {
    return null;
  }


  const history =
    await getSalesHistory(
      productId,
      30
    );


  const points =
    history.map(x => ({
      x: x.x,
      y: x.quantity
    }));


  const predictions = [];


  const lastX =
    points.length
      ? points[points.length - 1].x
      : 0;


  /* =====================================================
     FUTURE DEMAND PREDICTIONS
  ===================================================== */

  for (
    let i = 1;
    i <= horizon;
    i++
  ) {

    const predicted =
      linearRegressionPredict(
        points,
        lastX + i
      );


    predictions.push({
      day: i,

      // Convert decimal demand into whole units
      predictedDemand:
        Math.max(
          0,
          Math.round(predicted * 100)
        )
    });
  }


  /* =====================================================
     AVERAGE DAILY DEMAND
  ===================================================== */

  const totalQuantity =
    history.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );


  const avg =
    totalQuantity /
    Math.max(
      1,
      history.length
    );


  const averageDailyDemand =
    Math.max(
      0,
      Math.round(avg * 100)
    );


  return {

    productId,

    productName:
      product.name,

    currentStock:
      product.stock,

    averageDailyDemand,

    predictions,

    model:
      'time-indexed linear regression baseline',

    trainingDays:
      history.length
  };
}


/* =========================================================
   INVENTORY INTELLIGENCE
========================================================= */

async function inventoryIntelligence() {

  const products =
    await getProducts({
      limit: 500
    });


  const output = [];


  for (const p of products) {

    const history =
      await getSalesHistory(
        p.id,
        14
      );


    const totalQuantity =
      history.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      );


    const daily =
      totalQuantity / 14;


    const averageDailyDemand =
      Math.max(
        0,
        Math.round(daily * 100)
      );


    const days =
      daily > 0
        ? p.stock / daily
        : null;


    const estimatedHoursRemaining =
      days == null
        ? null
        : Number(
            (days * 24).toFixed(1)
          );


    const recommendedReorder =
      daily > 0
        ? Math.max(
            0,
            Math.ceil(
              daily * 3 - p.stock
            )
          )
        : 0;


    const risk =
      days != null && days < 1
        ? 'CRITICAL'
        : days != null && days < 3
        ? 'WARNING'
        : 'HEALTHY';


    output.push({

      productId:
        p.id,

      name:
        p.name,

      stock:
        p.stock,

      averageDailyDemand,

      estimatedHoursRemaining,

      recommendedReorder,

      risk
    });
  }


  return output.sort(
    (a, b) =>
      (
        a.estimatedHoursRemaining ??
        999999
      ) -
      (
        b.estimatedHoursRemaining ??
        999999
      )
  );
}


/* =========================================================
   EXPIRY INTELLIGENCE
========================================================= */

async function expiryIntelligence(
  productId,
  expiryDays
) {

  const products =
    await getProducts({
      limit: 500
    });


  const p =
    products.find(
      x =>
        String(x.id) ===
        String(productId)
    );


  if (!p) {
    return null;
  }


  const history =
    await getSalesHistory(
      productId,
      14
    );


  const totalQuantity =
    history.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );


  const daily =
    totalQuantity / 14;


  const projectedSales =
    daily *
    Math.max(
      0,
      expiryDays
    );


  const unsold =
    Math.max(
      0,
      p.stock - projectedSales
    );


  const discount =
    unsold > 0
      ? Math.min(
          25,
          Math.max(
            5,
            Math.round(
              (
                unsold /
                Math.max(
                  1,
                  p.stock
                )
              ) * 20
            )
          )
        )
      : 0;


  return {

    productId,

    productName:
      p.name,

    stock:
      p.stock,

    expiryDays,

    projectedSales:
      Number(
        projectedSales.toFixed(1)
      ),

    projectedUnsold:
      Number(
        unsold.toFixed(1)
      ),

    suggestedDiscountPercent:
      discount,

    recommendation:
      discount
        ? `Create a ${discount}% expiry-aware promotion.`
        : 'Normal selling velocity expected.'
  };
}


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  demandForecast,
  inventoryIntelligence,
  expiryIntelligence
};