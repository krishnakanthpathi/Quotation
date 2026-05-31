import type {
  ComputedLineItem,
  LineItem,
  QuotationState,
  QuotationTotals,
} from '../types/quotation'

export function splitPaise(totalPaise: number): { rs: number; ps: number } {
  const rounded = Math.round(totalPaise)
  const rs = Math.floor(rounded / 100)
  const ps = rounded % 100
  return { rs, ps }
}

export function toPaise(rs: number, ps: number): number {
  return rs * 100 + ps
}

export function amountFromQuantityRate(quantity: number, rate: number): {
  rs: number
  ps: number
} {
  const totalPaise = Math.round(quantity * rate * 100)
  return splitPaise(totalPaise)
}

export function buildAccessoriesString(item: LineItem): string {
  const parts: string[] = []
  if (item.accessoryExtraDisplay) parts.push('Extra Display')
  if (item.accessoryBatteryBackup) parts.push('Battery Backup')
  if (item.accessoryWindShield) parts.push('Wind Shield')
  if (item.accessoriesOther.trim()) parts.push(item.accessoriesOther.trim())
  return parts.join(', ')
}

export function computeLineItem(item: LineItem): ComputedLineItem {
  const { rs, ps } = amountFromQuantityRate(item.quantity, item.rate)
  return {
    ...item,
    amountRs: rs,
    amountPs: ps,
    accessories: buildAccessoriesString(item),
  }
}

export function computeTotals(
  lineItems: ComputedLineItem[],
  state: Pick<
    QuotationState,
    'salesTaxPercent' | 'packingForwarding' | 'installationCharges'
  >,
): QuotationTotals {
  const subtotalPaise = lineItems.reduce(
    (sum, item) => sum + toPaise(item.amountRs, item.amountPs),
    0,
  )
  const { rs: subtotalRs, ps: subtotalPs } = splitPaise(subtotalPaise)

  const salesTaxPaise = Math.round(
    subtotalPaise * (state.salesTaxPercent / 100),
  )
  const { rs: salesTaxRs, ps: salesTaxPs } = splitPaise(salesTaxPaise)

  const extrasPaise = Math.round(
    (state.packingForwarding + state.installationCharges) * 100,
  )
  const grandPaise = subtotalPaise + salesTaxPaise + extrasPaise
  const { rs: grandTotalRs, ps: grandTotalPs } = splitPaise(grandPaise)

  return {
    subtotalRs,
    subtotalPs,
    salesTaxRs,
    salesTaxPs,
    grandTotalRs,
    grandTotalPs,
  }
}

export function renumberLineItems(items: LineItem[]): LineItem[] {
  return items.map((item, index) => ({ ...item, sNo: index + 1 }))
}

/** Works on HTTP and older browsers where crypto.randomUUID is unavailable */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function createEmptyLineItem(sNo: number): LineItem {
  return {
    id: generateId(),
    sNo,
    make: '',
    model: '',
    capacity: '',
    accuracy: '',
    type: '',
    accessoryExtraDisplay: false,
    accessoryBatteryBackup: false,
    accessoryWindShield: false,
    accessoriesOther: '',
    quantity: 0,
    rate: 0,
  }
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}
