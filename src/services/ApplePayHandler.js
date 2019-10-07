
//------------------------------------------------------------------
// MARK: METHOD FOR CHECKING IF APPLE PAY IS AVAILABLE
//------------------------------------------------------------------

export const canMakeApplePayPayments = () => {
    return new Promise((resolve, reject) => {

        const session = window.ApplePaySession
        const canMakePayment = session.canMakePayments()

        if (session && canMakePayment) {
            resolve(true)
        } else {
            reject(false)
        }
    })
}

//------------------------------------------------------------------
// MARK: MAKES A REQUEST TO THE APPLE SERVERS FOR PAYMENT VALIDATION
//------------------------------------------------------------------

export const fetchApplePaySession = (validationURL, configuration) => {

    const body = {
        merchantIdentifier: configuration.applePayConfiguration.merchantIdentifier,
        displayName: configuration.displayName,
        initiative: "web",
        initiativeContext: configuration.domainName,
        url: validationURL,
        cert: configuration.applePayConfiguration.certificate,
        key: configuration.applePayConfiguration.key,
    }

    const options = {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }

    return fetch(validationURL, options)
}