
//---------------------------------------------------------------------------------
// Returns true if Apple Pay is enabled
//---------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------
// Returns an ApplePaySession from the validation URL
//---------------------------------------------------------------------------------

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