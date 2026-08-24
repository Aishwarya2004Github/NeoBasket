export const DisplayPriceInRupees = (price) => {
  const numericPrice = Number(
    typeof price === "string"
      ? price.replace(/[₹,\s]/g, "")
      : price
  );

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericPrice) ? numericPrice : 0);
};

export const getProductPrice = (product) => {
  if (!product) return 0;

  const possiblePrices = [
    product.price,
    product.salePrice,
    product.sellingPrice,
    product.discountPrice,
    product.finalPrice,
    product.unitPrice,
    product.cost,
    product.amount,
  ];

  for (const value of possiblePrices) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      Number.isFinite(
        Number(
          typeof value === "string"
            ? value.replace(/[₹,\s]/g, "")
            : value
        )
      )
    ) {
      return Number(
        typeof value === "string"
          ? value.replace(/[₹,\s]/g, "")
          : value
      );
    }
  }

  return 0;
};