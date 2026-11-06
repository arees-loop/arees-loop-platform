export type ExpectedPayment = { reference: string; amountMinor: number; currency: string; merchantId: string };
export type BankPayment = ExpectedPayment & { transactionId: string; status: string; authenticated: boolean };
export function isVerifiedPayment(order: ExpectedPayment, bank: BankPayment): boolean {
  return bank.authenticated === true
    && bank.status === "SUCCESS"
    && bank.reference === order.reference
    && order.reference.length > 0
    && Number.isSafeInteger(order.amountMinor)
    && order.amountMinor > 0
    && bank.amountMinor === order.amountMinor
    && order.currency === "SAR"
    && bank.currency === order.currency
    && order.merchantId.length > 0
    && bank.merchantId === order.merchantId
    && bank.transactionId.length > 0;
}

