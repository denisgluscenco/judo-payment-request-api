import { ApplePayConfiguration } from './ApplePayTypes';
import { GooglePayConfiguration } from './GooglePayTypes';
export declare enum JudoButtonType {
    APPLE_PAY = "applePay",
    NONE = "none"
}
export interface PaymentItem {
    label: string;
    amount: string;
    currency: string;
    pending?: boolean;
}
export interface ShippingOption {
    label: string;
    amount: string;
    currency: string;
}
export interface BillingDetails {
    name: string;
    email: string;
    phone: string;
}
export interface ShippingDetails {
    addressLine: string[];
    city: string;
    country: string;
    dependentLocality: string;
    languageCode: string;
    organization: string;
    phone: string;
    postalCode: string;
    recipient: string;
    region: string;
    sortingCode: string;
}
export interface JudoPaymentResponse {
    googleApiVersion?: number;
    googleApiMinor?: number;
    paymentDetails: any;
    billingDetails?: BillingDetails;
    shippingDetails?: ShippingDetails;
}
export interface JudoPayConfiguration {
    displayName: string;
    domainName: string;
    countryCode: string;
    applePayConfiguration: ApplePayConfiguration;
    googlePayConfiguration: GooglePayConfiguration;
    paymentDetails: PaymentDetailsInit;
    paymentOptions: PaymentOptions;
}
