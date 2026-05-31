import { useCallback, useMemo, useState } from 'react'
import type { ComputedQuotation, LineItem, QuotationState } from '../types/quotation'
import {
  computeLineItem,
  computeTotals,
  createEmptyLineItem,
  renumberLineItems,
  todayIsoDate,
} from '../utils/calculations'

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

export function useQuotationForm() {
  const [state, setState] = useState<QuotationState>(createInitialState)

  const computed = useMemo<ComputedQuotation>(() => {
    const lineItems = state.lineItems.map(computeLineItem)
    const totals = computeTotals(lineItems, state)
    return { state, lineItems, totals }
  }, [state])

  const updateField = useCallback(
    <K extends keyof QuotationState>(key: K, value: QuotationState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const updateLineItem = useCallback(
    (id: string, patch: Partial<LineItem>) => {
      setState((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }))
    },
    [],
  )

  const addLineItem = useCallback(() => {
    setState((prev) => {
      const next = [...prev.lineItems, createEmptyLineItem(prev.lineItems.length + 1)]
      return { ...prev, lineItems: renumberLineItems(next) }
    })
  }, [])

  const removeLineItem = useCallback((id: string) => {
    setState((prev) => {
      if (prev.lineItems.length <= 1) return prev
      const filtered = prev.lineItems.filter((item) => item.id !== id)
      return { ...prev, lineItems: renumberLineItems(filtered) }
    })
  }, [])

  return {
    state,
    computed,
    updateField,
    updateLineItem,
    addLineItem,
    removeLineItem,
  }
}

export type UseQuotationFormReturn = ReturnType<typeof useQuotationForm>
