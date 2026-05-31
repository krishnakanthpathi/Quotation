import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import padStyles from '../components/quotation-pad.css?inline'

function resolvePadElement(element: HTMLElement): HTMLElement {
  if (element.classList.contains('quotation-pad')) return element
  const found = element.querySelector('.quotation-pad')
  if (!(found instanceof HTMLElement)) {
    throw new Error('Quotation pad element not found')
  }
  return found
}

function waitForLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

/**
 * Renders the pad inside an isolated iframe so html2canvas never parses
 * Tailwind v4 stylesheets that use unsupported oklch() color functions.
 */
export async function downloadQuotationPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const pad = resolvePadElement(element)

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  Object.assign(iframe.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '794px',
    height: '1400px',
    border: 'none',
    visibility: 'hidden',
  })
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    if (!doc) throw new Error('Could not access export iframe')

    doc.open()
    doc.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${padStyles}</style></head><body style="margin:0;padding:0;background:#ffffff;color:#000000;"></body></html>`,
    )
    doc.close()

    const clone = pad.cloneNode(true) as HTMLElement
    clone.style.width = '210mm'
    clone.style.minHeight = '297mm'
    clone.style.boxShadow = 'none'
    doc.body.appendChild(clone)

    await waitForLayout()

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: clone.offsetWidth,
      height: clone.offsetHeight,
    })

    const img = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    // Preserve aspect ratio — do not stretch to full page height or spacing changes vanish
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    if (pdfHeight > pageHeight) {
      const scaledWidth = (canvas.width * pageHeight) / canvas.height
      pdf.addImage(img, 'PNG', (pdfWidth - scaledWidth) / 2, 0, scaledWidth, pageHeight)
    } else {
      pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)
    }
    pdf.save(filename)
  } finally {
    document.body.removeChild(iframe)
  }
}

export function quotationPdfFilename(
  quotationNo: string,
  refNumber: string,
): string {
  const slug = (quotationNo || refNumber || 'draft').replace(/[^\w-]+/g, '_')
  return `SVLN-Quotation-${slug}.pdf`
}
