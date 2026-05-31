import type { ComputedQuotation } from '../types/quotation'
import { PdfTemplate } from './PdfTemplate'

interface QuotationPreviewProps {
  data: ComputedQuotation
}

export function QuotationPreview({ data }: QuotationPreviewProps) {
  return (
    <div
      className="transform origin-top scale-[0.5] sm:scale-[0.7] lg:scale-[0.8] lg:hover:scale-[0.85] transition-transform duration-300"
      style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)' }}
    >
      <PdfTemplate data={data} />
    </div>
  )
}
