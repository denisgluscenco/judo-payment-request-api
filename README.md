# JudoPay PaymentRequest API Implementation

This is a private package containing the `Payment Request API` implementation used in our custom Judo Payment Button. The Payment Request API is a cross-platform payment solution that is adopted by native credit payments and by third-party providers (Google Pay, Apple Pay, etc.)

## Features
- `canMakeApplePayPayments` - promise that resolves to true if ApplePay is enabled;

- `handlePayment(configuration, responseHandler)` - method that has to be passed to the `onclick` handler in order to start the payment flow;

> **WARNING**: Some features are not going to work unless the domain hosting the payment button is served over HTTPS and has a valid SSL certificate.

> **WARNING**: At this moment, Apple Pay validation has not been tested due to the issue above, and might not work.

## Usage

**STEP 1 -** Import the methods from the Judo PaymentRequest API
```jsx
import { 
  canMakeApplePayPayments, 
  handlePayment 
  } from 'judo-payment-request-api'
```

**STEP 2 -** Use `canMakeApplePayPayments` to setup your button appearance and type
```jsx
canMakeApplePayPayments()
  .then((response) => {
      // 1. Customize button styling to comform to Apple guidelines;
      // 2. Setup Apple Pay configurations;
      // 3. Other stuff you might need;
  })
  .catch((error: Error) => {
      alert(error.message);
  })
```

**STEP 3 -** Execute `handlePayment` on button click to start payment flow
```jsx
const configuration = {
    // ...
}

const responseHandler = (response) => {
  // Handle payment response
}

const handleOnClick = () => {
  handlePayment(configuration, responseHandler)
}

if (buttonType === 'applePay') {
  return <button 
          className={classes.ApplePayButton} 
          onClick={handleOnClick}/>
}

return <div>Apple Pay not supported!</div>;
```

## License

MIT © [Judopay](https://github.com/Judopay)
