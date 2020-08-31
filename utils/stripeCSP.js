const stripe = (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://js.stripe.com/v3/"
  );

  return next();
};

module.exports = stripe;
