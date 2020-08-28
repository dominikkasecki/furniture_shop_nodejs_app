var stripe = Stripe(
  'pk_test_51H0SwSLziRUenFpFlHvBhP6rd21WIeNp8fDxCu3lhuq1YE0vWvfQ95XiNK1JWTbmdvFdWpfPp3yE7aI2dV4PRR5a00v8ucCPvO'
);

var sessionId = document.getElementById('sessionId').value;

const payBtn = document.getElementById('paybtn');

payBtn.addEventListener('click', function () {
  if (
    document.getElementById('isLoggedIn').value === 'true'
  ) {
    stripe.redirectToCheckout({
      sessionId,
    });
  }
});
