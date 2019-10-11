import { fetchApplePaySession } from './ApplePayHandler'

export const handlePayment = (type, configuration, responseHandler) => {

    getPaymentRequest(type, configuration)
        .then((request) => {
            handlePaymentRequest(request, configuration, responseHandler)
        })
        .catch((error) => {
            alert(error)
        })
}

const getPaymentRequest = (type, configuration) => {

    return new Promise((resolve, reject) => {

        if (window.PaymentRequest) {

            const methods = getPaymentMethods(type, configuration);
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

            const billingDetails = {
                name: response.payerName,
                email: response.payerEmail,
                phone: response.payerPhone
            }

            const shippingDetails = response.shippingAddress ? {
                addressLine: response.shippingAddress.addressLine,
                country: response.shippingAddress.country,
                city: response.shippingAddress.city,
                dependentLocality: response.shippingAddress.dependentLocality,
                organization: response.shippingAddress.organization,
                phone: response.shippingAddress.phone,
                postalCode: response.shippingAddress.postalCode,
                recipient: response.shippingAddress.recipient,
                region: response.shippingAddress.region,
                regionCode: response.shippingAddress.regionCode,
                sortingCode: response.shippingAddress.sortingCode
            } : undefined

            const paymentResponse = {
                paymentDetails: response.details,
                billingDetails: billingDetails,
                shippingDetails: shippingDetails
            }

            responseHandler(paymentResponse, null);
            return response.complete();
        })
        .catch(error => {
            responseHandler(null, error);
        })
}

const getPaymentMethods = (type, configuration) => {

    const paymentMethods = []

    if (type === 'applePay') {
        paymentMethods.push(getApplePayMethod(configuration));
    }

    return paymentMethods
}

const getApplePayMethod = (configuration) => {
    return {
        supportedMethods: "https://apple.com/apple-pay",
        data: {
            version: 1,
            merchantIdentifier: configuration.applePayConfiguration.merchantIdentifier,
            merchantCapabilities: configuration.applePayConfiguration.merchantCapabilities,
            supportedNetworks: configuration.applePayConfiguration.supportedNetworks,
            countryCode: configuration.countryCode,
        },
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
