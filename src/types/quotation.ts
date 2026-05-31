export interface LineItem {
  id: string
  sNo: number
  make: string
  model: string
  capacity: string
  accuracy: string
  type: string
  accessoryExtraDisplay: boolean
  accessoryBatteryBackup: boolean
  accessoryWindShield: boolean
  accessoriesOther: string
  quantity: number
  rate: number
}

export interface ComputedLineItem extends LineItem {
  amountRs: number
  amountPs: number
  accessories: string
}

export interface QuotationState {
  refNumber: string
  date: string
  toAddress: string
  quotationNo: string
  productSubject: string
  lineItems: LineItem[]
  totalRupeesWords: string
  salesTaxPercent: number
  packingForwarding: number
  installationCharges: number
  validityDays: number
  warranty: string
  paymentAdvPercent: number
  paymentDeliveryPercent: number
  deliveryDays: number
  others: string
}

export interface QuotationTotals {
  subtotalRs: number
  subtotalPs: number
  salesTaxRs: number
  salesTaxPs: number
  grandTotalRs: number
  grandTotalPs: number
}

export interface ComputedQuotation {
  state: QuotationState
  lineItems: ComputedLineItem[]
  totals: QuotationTotals
}
