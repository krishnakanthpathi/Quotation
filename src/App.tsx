import { useCallback, useState } from 'react'
import { FileDown, Lock } from 'lucide-react'
import { AppLockScreen } from './components/AppLockScreen'
import { PdfTemplate } from './components/PdfTemplate'
import { QuotationForm } from './components/QuotationForm'
import { QuotationPreview } from './components/QuotationPreview'
import { useAppLock } from './hooks/useAppLock'
import { useQuotationForm } from './hooks/useQuotationForm'
import {
  downloadQuotationPdf,
  quotationPdfFilename,
} from './utils/pdfExport'

function QuotationApp({ onLock }: { onLock: () => void }) {
  const form = useQuotationForm()
  const [exportNode, setExportNode] = useState<HTMLDivElement | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const exportRef = useCallback((node: HTMLDivElement | null) => {
    setExportNode(node)
  }, [])

  const generatePDF = async () => {
    if (!exportNode) return
    try {
      setIsGenerating(true)
      const filename = quotationPdfFilename(form.computed.state.refNumber)
      await downloadQuotationPdf(exportNode, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(
        `Failed to generate PDF. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-900 text-white p-4 shadow-md flex flex-col sm:flex-row justify-between items-center z-10 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          SVLN Quotation Generator
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLock}
            title="Lock app"
            className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Lock size={18} />
            Lock
          </button>
          <button
            type="button"
            onClick={generatePDF}
            disabled={isGenerating || !exportNode}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <FileDown size={20} />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex-1 min-h-[50vh] lg:min-h-0">
          <QuotationForm form={form} />
        </section>
        <section className="w-full lg:w-1/2 bg-gray-300 p-4 sm:p-8 overflow-y-auto overflow-x-auto flex justify-center items-start flex-1 min-h-[50vh] lg:min-h-0">
          <QuotationPreview data={form.computed} />
        </section>
      </main>

      <div
        aria-hidden
        className="pdf-export-host"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          pointerEvents: 'none',
        }}
      >
        <PdfTemplate ref={exportRef} data={form.computed} />
      </div>
    </div>
  )
}

function App() {
  const { unlocked, unlock, lock } = useAppLock()

  if (!unlocked) {
    return <AppLockScreen onUnlock={unlock} />
  }

  return <QuotationApp onLock={lock} />
}

export default App
