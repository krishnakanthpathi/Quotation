const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
]

function wordsBelow100(n: number): string {
  if (n === 0) return ''
  if (n < 20) return ONES[n]
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ''}`
}

function wordsBelow1000(n: number): string {
  if (n === 0) return ''
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  const parts: string[] = []
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`)
  if (rest) parts.push(wordsBelow100(rest))
  return parts.join(' ')
}

function wordsIndian(n: number): string {
  if (n === 0) return 'Zero'

  let remaining = n
  const parts: string[] = []

  const crore = Math.floor(remaining / 10000000)
  remaining %= 10000000
  const lakh = Math.floor(remaining / 100000)
  remaining %= 100000
  const thousand = Math.floor(remaining / 1000)
  remaining %= 1000

  if (crore) parts.push(`${wordsBelow100(crore)} Crore`)
  if (lakh) parts.push(`${wordsBelow100(lakh)} Lakh`)
  if (thousand) parts.push(`${wordsBelow100(thousand)} Thousand`)
  if (remaining) parts.push(wordsBelow1000(remaining))

  return parts.join(' ')
}

/** Convert grand total (Rs + Ps) to Indian English words for the quotation pad. */
export function rupeesToWords(rs: number, ps: number): string {
  const totalPaise = rs * 100 + ps
  if (totalPaise === 0) return ''

  if (ps === 0) {
    return `${wordsIndian(rs)} Rupees Only`
  }

  if (rs === 0) {
    return `${wordsBelow100(ps)} Paise Only`
  }

  return `${wordsIndian(rs)} Rupees and ${wordsBelow100(ps)} Paise Only`
}
