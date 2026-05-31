import type { LineItem, QuotationState } from '../types/quotation'
import { createEmptyLineItem, generateId, todayIsoDate } from './calculations'

export const QUOTATION_STORAGE_KEY = 'svln-quotation-draft'

function createInitialState(): QuotationState {
  return {
    refNumber: '',
    date: todayIsoDate(),
    toAddress: '',
    quotationNo: '',
    productSubject: '',
    lineItems: [createEmptyLineItem(1)],
    totalRupeesWords: '',
    salesTaxPercent: 0,
    packingForwarding: 0,
    installationCharges: 0,
    validityDays: 30,
    warranty: 'One Year',
    paymentAdvPercent: 50,
    paymentDeliveryPercent: 50,
    deliveryDays: 15,
    others: '',
  }
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeLineItem(raw: unknown, index: number): LineItem {
  const item = raw && typeof raw === 'object' ? (raw as Partial<LineItem>) : {}
  return {
    id: asString(item.id, generateId()),
    sNo: index + 1,
    make: asString(item.make),
    model: asString(item.model),
    capacity: asString(item.capacity),
    accuracy: asString(item.accuracy),
    type: asString(item.type),
    accessoryExtraDisplay: asBool(item.accessoryExtraDisplay),
    accessoryBatteryBackup: asBool(item.accessoryBatteryBackup),
    accessoryWindShield: asBool(item.accessoryWindShield),
    accessoryDustCover: asBool(item.accessoryDustCover),
    accessoryTripodStand: asBool(item.accessoryTripodStand),
    accessoriesOther: asString(item.accessoriesOther),
    quantity: asNumber(item.quantity),
    rate: asNumber(item.rate),
  }
}

function normalizeState(raw: unknown): QuotationState {
  const defaults = createInitialState()
  if (!raw || typeof raw !== 'object') return defaults

  const data = raw as Partial<QuotationState>
  const lineItems = Array.isArray(data.lineItems)
    ? data.lineItems.map(normalizeLineItem)
    : defaults.lineItems

  return {
    refNumber: asString(data.refNumber),
    date: asString(data.date, defaults.date),
    toAddress: asString(data.toAddress),
    quotationNo: asString(data.quotationNo),
    productSubject: asString(data.productSubject),
    lineItems: lineItems.length > 0 ? lineItems : defaults.lineItems,
    totalRupeesWords: asString(data.totalRupeesWords),
    salesTaxPercent: asNumber(data.salesTaxPercent),
    packingForwarding: asNumber(data.packingForwarding),
    installationCharges: asNumber(data.installationCharges),
    validityDays: asNumber(data.validityDays, defaults.validityDays),
    warranty: asString(data.warranty, defaults.warranty),
    paymentAdvPercent: asNumber(data.paymentAdvPercent, defaults.paymentAdvPercent),
    paymentDeliveryPercent: asNumber(
      data.paymentDeliveryPercent,
      defaults.paymentDeliveryPercent,
    ),
    deliveryDays: asNumber(data.deliveryDays, defaults.deliveryDays),
    others: asString(data.others),
  }
}

export function loadQuotationState(): QuotationState {
  try {
    const raw = localStorage.getItem(QUOTATION_STORAGE_KEY)
    if (!raw) return createInitialState()
    return normalizeState(JSON.parse(raw))
  } catch {
    return createInitialState()
  }
}

export function saveQuotationState(state: QuotationState): void {
  try {
    localStorage.setItem(QUOTATION_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode errors
  }
}

export function clearQuotationState(): void {
  try {
    localStorage.removeItem(QUOTATION_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export { createInitialState }
