import { fetchApplePaySession } from './ApplePayHandler'

//------------------------------------------------------------------
// MARK: BASE METHOD FOR CALLING THE PAYMENT HANDLING
//------------------------------------------------------------------

export const handlePayment = (type, configuration, responseHandler) => {

    getPaymentRequest(type, configuration)
        .then((request) => {
            handlePaymentRequest(request, configuration, responseHandler)
        })
        .catch((error) => {
            alert(error)
        })
}

//--------------------------------------------------------------------
// MARK: RETURNS A CONFIGURED PAYMENT REQUEST ONLY IF PAYMENT IS VALID
//--------------------------------------------------------------------

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

//------------------------------------------------------------------
// MARK: HANDLES THE PAYMENT PROCESS AND MAPS THE PAYMENT RESPONSE
//------------------------------------------------------------------

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

            const shippingDetails = {
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
            }

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

//--------------------------------------------------------------------
// MARK: CONVENIENCE METHOD FOR RETURNING THE AVAILABLE PAYMENT METHODS
//       (Currently only ApplePay is supported)
//--------------------------------------------------------------------

const getPaymentMethods = (type, configuration) => {

    const paymentMethods = []

    if (type === 'applePay') {
        paymentMethods.push(getApplePayMethod(configuration));
    }

    return paymentMethods
}

//--------------------------------------------------------------------
// MARK: RETURN A CONFIGURED APPLE PAY METHOD
//--------------------------------------------------------------------

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

//--------------------------------------------------------------------
// MARK: HANDLE THE MERCHANT VALIDATION CALLBACK EVENT
//--------------------------------------------------------------------
const handleMerchantValidation = (configuration) => {
    return (event) => {
        const sessionPromise = fetchApplePaySession(event.validationURL, configuration)
        event.complete(sessionPromise);
    }
}

//--------------------------------------------------------------------
// MARK: HANDLE THE SHIPPING ADDRESS CHANGE CALLBACK EVENT
//--------------------------------------------------------------------
const handleShippingAddressChanged = (configuration) => {
    return (event) => {
        event.updateWith(configuration.paymentDetails)
    }
}

//--------------------------------------------------------------------
// MARK: HANDLE THE SHIPPING OPTION CHANGE CALLBACK EVENT AND CALCULATE
//       THE NEW TOTAL PRICE BASED ON USER CHOICE
//--------------------------------------------------------------------
const handleShippingOptionChanged = (configuration) => {
    return (event) => {
        const paymentDetails = getUpdatedDetails(
            configuration.paymentDetails,
            event.target.shippingOption
        )
        event.updateWith(paymentDetails)
    }
}

//--------------------------------------------------------------------
// MARK: CONVENIENCE METHOD FOR CALCULATING NEW PRICE TOTALS
//--------------------------------------------------------------------
const getUpdatedDetails = (paymentDetails, shippingType) => {

    // 1. Find the shipping option selected from the list of available shipping options
    const shippingOption = paymentDetails.shippingOptions.filter(option => option.id === shippingType).shift()

    // 2. Set the shipping option to 'selected' state
    shippingOption.selected = true

    // 3. If there are display items (total != 0)
    if (paymentDetails.displayItems !== undefined) {

        // 3.1. Get the price list for every shipping item
        const prices = paymentDetails.displayItems.map(item => Number(item.amount.value));

        // 3.2. Calculate the total based on the individual prices
        const total = prices.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        });

        // 3.3. Append the shipping cost to the total
        paymentDetails.total.amount.value = String(Number(total) + Number(shippingOption.amount.value))
    } else {
        // 3.1. If there are no display items (total == 0), add the shipping amount to the total
        paymentDetails.total.amount.value = shippingOption.amount.value
    }

    // 4. Return the updated payment details
    return paymentDetails;
}
