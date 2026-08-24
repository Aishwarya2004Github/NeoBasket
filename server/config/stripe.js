import StripePackage from "stripe";

const stripe = new StripePackage(process.env.STRIPE_SECRET_KEY);

export default stripe;