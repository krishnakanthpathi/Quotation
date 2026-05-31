import type { AiLineItem, AiQuotationExtract } from '../types/aiAutofill'
import type { LineItem, QuotationState } from '../types/quotation'
import { generateId, renumberLineItems, todayIsoDate } from './calculations'
import { getGeminiModel } from './aiApiKey'
import { blobToBase64 } from './voiceInput'

const SYSTEM_PROMPT = `You extract quotation data for SVLN WEIGHING SCALES (electronic weighing machines & weigh bridges) from unstructured text.

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "refNumber": "string",
  "date": "YYYY-MM-DD or empty",
  "toAddress": "customer name and address, preserve line breaks as \\n",
  "productSubject": "string",
  "lineItems": [{
    "make": "string",
    "model": "string",
    "capacity": "string",
    "accuracy": "string",
    "type": "string e.g. Bench Scale, Platform Scale",
    "accessoryExtraDisplay": boolean,
    "accessoryBatteryBackup": boolean,
    "accessoryWindShield": boolean,
    "accessoryDustCover": boolean,
    "accessoryTripodStand": boolean,
    "accessoriesOther": "string for any other accessories",
    "quantity": number,
    "rate": number
  }],
  "salesTaxPercent": number,
  "packingForwarding": number,
  "installationCharges": number,
  "validityDays": number,
  "warranty": "string default One Year if not specified",
  "paymentAdvPercent": number,
  "paymentDeliveryPercent": number,
  "deliveryDays": number,
  "others": "string"
}

Rules:
- Infer multiple scales as separate lineItems when described.
- Map accessories: extra display, battery backup, wind shield, dust cover, tripod stand to the boolean fields.
- Use 0 for unknown numeric fields, empty string for unknown text.
- Parse dates to ISO YYYY-MM-DD when possible.
- Rate is per unit in Indian Rupees.`

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function asBool(v: unknown): boolean {
  return v === true
}

function normalizeDate(raw: string): string {
  const s = raw.trim()
  if (!s) return todayIsoDate()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const dmy = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return todayIsoDate()
}

function normalizeLineItem(raw: AiLineItem, index: number): LineItem {
  return {
    id: generateId(),
    sNo: index + 1,
    make: asString(raw.make),
    model: asString(raw.model),
    capacity: asString(raw.capacity),
    accuracy: asString(raw.accuracy),
    type: asString(raw.type),
    accessoryExtraDisplay: asBool(raw.accessoryExtraDisplay),
    accessoryBatteryBackup: asBool(raw.accessoryBatteryBackup),
    accessoryWindShield: asBool(raw.accessoryWindShield),
    accessoryDustCover: asBool(raw.accessoryDustCover),
    accessoryTripodStand: asBool(raw.accessoryTripodStand),
    accessoriesOther: asString(raw.accessoriesOther),
    quantity: asNumber(raw.quantity),
    rate: asNumber(raw.rate),
  }
}

export function mergeAiExtractIntoState(
  current: QuotationState,
  extract: AiQuotationExtract,
): QuotationState {
  const rawItems = Array.isArray(extract.lineItems) ? extract.lineItems : []
  const lineItems =
    rawItems.length > 0
      ? renumberLineItems(rawItems.map(normalizeLineItem))
      : current.lineItems

  return {
    ...current,
    refNumber: asString(extract.refNumber) || current.refNumber,
    date: extract.date ? normalizeDate(asString(extract.date)) : current.date,
    toAddress: asString(extract.toAddress) || current.toAddress,
    productSubject: asString(extract.productSubject) || current.productSubject,
    lineItems,
    salesTaxPercent:
      extract.salesTaxPercent !== undefined
        ? asNumber(extract.salesTaxPercent)
        : current.salesTaxPercent,
    packingForwarding:
      extract.packingForwarding !== undefined
        ? asNumber(extract.packingForwarding)
        : current.packingForwarding,
    installationCharges:
      extract.installationCharges !== undefined
        ? asNumber(extract.installationCharges)
        : current.installationCharges,
    validityDays:
      extract.validityDays !== undefined
        ? asNumber(extract.validityDays, current.validityDays)
        : current.validityDays,
    warranty: asString(extract.warranty) || current.warranty || 'One Year',
    paymentAdvPercent:
      extract.paymentAdvPercent !== undefined
        ? asNumber(extract.paymentAdvPercent, current.paymentAdvPercent)
        : current.paymentAdvPercent,
    paymentDeliveryPercent:
      extract.paymentDeliveryPercent !== undefined
        ? asNumber(extract.paymentDeliveryPercent, current.paymentDeliveryPercent)
        : current.paymentDeliveryPercent,
    deliveryDays:
      extract.deliveryDays !== undefined
        ? asNumber(extract.deliveryDays, current.deliveryDays)
        : current.deliveryDays,
    others: extract.others !== undefined ? asString(extract.others) : current.others,
  }
}

async function callGeminiExtract(
  apiKey: string,
  parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>,
): Promise<AiQuotationExtract> {
  const model = getGeminiModel()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const message =
      (err as { error?: { message?: string } })?.error?.message ??
      `Gemini API error (${response.status})`
    throw new Error(message)
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty response from Gemini')

  try {
    return JSON.parse(content) as AiQuotationExtract
  } catch {
    throw new Error('Gemini returned invalid JSON')
  }
}

export async function extractQuotationFromText(
  apiKey: string,
  userText: string,
): Promise<AiQuotationExtract> {
  return callGeminiExtract(apiKey, [
    {
      text: `${SYSTEM_PROMPT}\n\nExtract quotation fields from this text:\n\n${userText}`,
    },
  ])
}

export async function extractQuotationFromAudio(
  apiKey: string,
  audioBlob: Blob,
  mimeType: string,
): Promise<AiQuotationExtract> {
  const base64 = await blobToBase64(audioBlob)
  const normalizedMime = mimeType.split(';')[0] || 'audio/webm'

  return callGeminiExtract(apiKey, [
    {
      text: `${SYSTEM_PROMPT}\n\nListen to this voice recording of a quotation request. The speaker may use English, Telugu, or a mix. Transcribe and extract quotation fields as JSON.`,
    },
    {
      inline_data: {
        mime_type: normalizedMime,
        data: base64,
      },
    },
  ])
}
