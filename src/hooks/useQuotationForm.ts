import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComputedQuotation, LineItem, QuotationState } from '../types/quotation'
import {
  computeLineItem,
  computeTotals,
  createEmptyLineItem,
  renumberLineItems,
} from '../utils/calculations'
import { rupeesToWords } from '../utils/numberToWords'
import {
  clearQuotationState,
  createInitialState,
  loadQuotationState,
  saveQuotationState,
} from '../utils/quotationStorage'
import type { AiQuotationExtract } from '../types/aiAutofill'
import { mergeAiExtractIntoState } from '../utils/aiAutofill'

export function useQuotationForm() {
  const [state, setState] = useState<QuotationState>(loadQuotationState)

  useEffect(() => {
    saveQuotationState(state)
  }, [state])

  const computed = useMemo<ComputedQuotation>(() => {
    const lineItems = state.lineItems.map(computeLineItem)
    const totals = computeTotals(lineItems, state)
    return { state, lineItems, totals }
  }, [state])

  const { subtotalRs, subtotalPs } = computed.totals

  useEffect(() => {
    const words = rupeesToWords(subtotalRs, subtotalPs)
    setState((prev) =>
      prev.totalRupeesWords === words
        ? prev
        : { ...prev, totalRupeesWords: words },
    )
  }, [subtotalRs, subtotalPs])

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

  const resetForm = useCallback(() => {
    clearQuotationState()
    setState(createInitialState())
  }, [])

  const applyAiAutofill = useCallback((extract: AiQuotationExtract) => {
    setState((prev) => mergeAiExtractIntoState(prev, extract))
  }, [])

  return {
    state,
    computed,
    updateField,
    updateLineItem,
    addLineItem,
    removeLineItem,
    resetForm,
    applyAiAutofill,
  }
}

export type UseQuotationFormReturn = ReturnType<typeof useQuotationForm>
