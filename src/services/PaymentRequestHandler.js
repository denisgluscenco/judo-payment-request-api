
export const handlePayment = (configuration, responseHandler) => {

    getPaymentRequest(configuration)
        .then((request) => {
            handlePaymentRequest(request, configuration, responseHandler)
        })
        .catch((error) => {
            alert(error)
        })
}

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

const getPaymentMethods = (configuration) => {

    const paymentMethods = []

    configuration.supportedMethods.forEach((method) => {
        switch (method) {
            case "basic-card":
                paymentMethods.push(getCreditCardMethod(configuration));
                break;
            case "apple-pay":
                paymentMethods.push(getApplePayMethod(configuration));
                break;
            default:
                break;
        }
    })

    return paymentMethods
}

const getApplePayMethod = (configuration) => {
    return {
        supportedMethods: "https://apple.com/apple-pay",
        data: {
            version: 1,
            merchantIdentifier: configuration.applePayConfiguration.merchantIdentifier,
            merchantCapabilities: configuration.merchantCapabilities,
            supportedNetworks: configuration.supportedNetworks,
            countryCode: configuration.countryCode,
        },
    }
}

const getCreditCardMethod = (configuration) => {
    return {
        supportedMethods: ['basic-card'],
        data: {
            supportedNetworks: configuration.supportedNetworks
        }
    }
}

const handleMerchantValidation = (configuration) => {
    return (event) => {
        const sessionPromise = fetchApplePaySession(event.validationURL, configuration)
        event.complete(sessionPromise);
    }
}

const handleShippingAddressChanged = (configuration) => {
    return (event) => {
        event.updateWith(configuration.paymentDetails)
    }
}

const handleShippingOptionChanged = (configuration) => {
    return (event) => {
        const paymentDetails = getUpdatedDetails(
            configuration.paymentDetails,
            event.target.shippingOption
        )
        event.updateWith(paymentDetails)
    }
}

const getUpdatedDetails = (paymentDetails, shippingType) => {

    const shippingOption = paymentDetails.shippingOptions.filter(option => option.id === shippingType).shift()
    shippingOption.selected = true

    if (paymentDetails.displayItems !== undefined) {

        const prices = paymentDetails.displayItems.map(item => Number(item.amount.value));

        const total = prices.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        });

        paymentDetails.total.amount.value = String(Number(total) + Number(shippingOption.amount.value))
    } else {
        paymentDetails.total.amount.value = shippingOption.amount.value
    }

    return paymentDetails;
}
