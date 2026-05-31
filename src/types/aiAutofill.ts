export interface AiLineItem {
  make?: string
  model?: string
  capacity?: string
  accuracy?: string
  type?: string
  accessoryExtraDisplay?: boolean
  accessoryBatteryBackup?: boolean
  accessoryWindShield?: boolean
  accessoryDustCover?: boolean
  accessoryTripodStand?: boolean
  accessoriesOther?: string
  quantity?: number
  rate?: number
}

export interface AiQuotationExtract {
  refNumber?: string
  date?: string
  toAddress?: string
  productSubject?: string
  lineItems?: AiLineItem[]
  salesTaxPercent?: number
  packingForwarding?: number
  installationCharges?: number
  validityDays?: number
  warranty?: string
  paymentAdvPercent?: number
  paymentDeliveryPercent?: number
  deliveryDays?: number
  others?: string
}
