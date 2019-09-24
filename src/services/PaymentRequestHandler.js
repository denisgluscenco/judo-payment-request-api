
//---------------------------------------------------------------------------------
// Main method for handling payment on button click
//---------------------------------------------------------------------------------

export const handlePayment = (configuration, responseHandler) => {

    getPaymentRequest(configuration)
        .then((request) => {
            handlePaymentRequest(request, configuration, responseHandler)
        })
        .catch((error) => {
            alert(error)
        })
}

//---------------------------------------------------------------------------------
// Returns a configured PaymentRequest object if available
//---------------------------------------------------------------------------------

const getPaymentRequest = (configuration) => {

    return new Promise((resolve, reject) => {

        if (window.PaymentRequest) {

            const methods = getPaymentMethods(configuration);
            const details = configuration.paymentDetails;
            const options = configuration.paymentOptions;

            const paymentRequest = new PaymentRequest(methods, details, options)

            if (paymentRequest.canMakePayment()) {
                resolve(paymentRequest)
            } else {
                reject("Cannot make payments with PaymentRequest on your device/browser!")
            }

        } else {
            reject("PaymentRequest not available for your device/browser!")
        }
    })
}

//---------------------------------------------------------------------------------
// Handle PaymentRequest logic of showing payment sheet and processing the response
//---------------------------------------------------------------------------------

const handlePaymentRequest = (paymentRequest, configuration, responseHandler) => {

    paymentRequest.onmerchantvalidation = handleMerchantValidation(configuration);
    paymentRequest.onshippingoptionchange = handleShippingOptionChanged(configuration);
    paymentRequest.onshippingoptionchange = handleShippingAddressChanged(configuration)

    paymentRequest.show()
        .then(response => {
            responseHandler(response);
            return response.complete();
        })
        .catch(exception => {
            (exception.code === 20) ? console.log(exception.message) : alert(exception.message);
        })
}

//---------------------------------------------------------------------------------
// Returns an array of configured payment methods from the types specified
//---------------------------------------------------------------------------------

const getPaymentMethods = (configuration) => {

    const paymentMethods = []

    configuration.supportedMethods.forEach((method) => {
        switch (method) {
            case "creditCard":
                paymentMethods.push(getCreditCardMethod(configuration));
                break;
            case "applePay":
                paymentMethods.push(getApplePayMethod(configuration));
                break;
            default:
                break;
        }
    })

    return paymentMethods
}

//---------------------------------------------------------------------------------
// Returns a configured Apple Pay payment method
//---------------------------------------------------------------------------------

const getApplePayMethod = (configuration) => {
    return {
        supportedMethods: "https://apple.com/apple-pay",
        data: {
            version: 1,
            merchantIdentifier: configuration.applePayConfiguration.merchantIdentifier,
            merchantCapabilities: configuration.merchantCapabilities,
            supportedNetworks: configuration.supportedMethods,
            countryCode: configuration.countryCode,
        },
    }
}

//---------------------------------------------------------------------------------
// Returns a configured Credit Card payment method
//---------------------------------------------------------------------------------

const getCreditCardMethod = (configuration) => {
    return {
        supportedMethods: ['basic-card'],
        data: {
            supportedNetworks: configuration.supportedNetworks
        }
    }
}

//---------------------------------------------------------------------------------
// Handler used for validating session, called once the ApplePay payment sheet is 
// displayed
//---------------------------------------------------------------------------------

const handleMerchantValidation = (configuration) => {
    return (event) => {
        const sessionPromise = fetchApplePaySession(event.validationURL, configuration)
        event.complete(sessionPromise);
    }
}

//---------------------------------------------------------------------------------
// Handler called when the user changes the shipping method
//---------------------------------------------------------------------------------

const handleShippingOptionChanged = (configuration) => {
    return (event) => {
        event.updateWith(configuration.paymentDetails)
    }
}

//---------------------------------------------------------------------------------
// Handler called when the user changes the shipping address
//---------------------------------------------------------------------------------

const handleShippingAddressChanged = (configuration) => {
    return (event) => {
        event.updateWith(configuration.paymentDetails)
    }
}