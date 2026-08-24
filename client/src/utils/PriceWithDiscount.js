export const pricewithDiscount = (price, dis = 0) => {
  const finalPrice = Number(price) || 0;
  const discount = Number(dis) || 0;

  const discountAmount = Math.ceil(
    (finalPrice * discount) / 100
  );

  return Math.max(0, finalPrice - discountAmount);
};