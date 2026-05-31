import { forwardRef } from 'react'
import type { ComputedLineItem, ComputedQuotation } from '../types/quotation'
import './quotation-pad.css'

interface PdfTemplateProps {
  data: ComputedQuotation
}

function formatDisplayDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (y && m && d) return `${d}/${m}/${y}`
  return iso
}

function formatAmountParts(rs: number, ps: number): { rs: string; ps: string } {
  const show = rs > 0 || ps > 0
  return {
    rs: show ? String(rs) : '',
    ps: show ? String(ps).padStart(2, '0') : '',
  }
}

function ItemDescription({ item }: { item: ComputedLineItem }) {
  const rows = (
    [
      ['Make', item.make],
      ['Model', item.model],
      ['Capacity', item.capacity],
      ['Accuracy', item.accuracy],
      ['Type', item.type],
      ['Accessories', item.accessories],
    ] as const
  ).filter(([, value]) => value.trim() !== '')

  if (rows.length === 0) return null

  return (
    <div className="pad-desc">
      {rows.map(([label, value]) => (
        <div key={label} className="pad-desc-line">
          <span className="pad-desc-label">{label}</span> :{' '}
          <span className="pad-desc-value">{value}</span>
        </div>
      ))}
    </div>
  )
}

function hasLineItemContent(item: ComputedLineItem): boolean {
  return (
    item.make.trim() !== '' ||
    item.model.trim() !== '' ||
    item.capacity.trim() !== '' ||
    item.accuracy.trim() !== '' ||
    item.type.trim() !== '' ||
    item.accessories.trim() !== '' ||
    item.quantity > 0 ||
    item.rate > 0
  )
}

export const PdfTemplate = forwardRef<HTMLDivElement, PdfTemplateProps>(
  function PdfTemplate({ data }, ref) {
    const { state, lineItems, totals } = data
    const totalFmt = formatAmountParts(totals.subtotalRs, totals.subtotalPs)
    const filledItems = lineItems.filter(hasLineItemContent)
    const showQty = filledItems.some((i) => i.quantity > 0)
    const showRate = filledItems.some((i) => i.rate > 0)
    const showAmount =
      filledItems.some((i) => i.amountRs > 0 || i.amountPs > 0) ||
      totals.subtotalRs > 0 ||
      totals.subtotalPs > 0
    const totalLabelColSpan =
      1 + 1 + (showQty ? 1 : 0) + (showRate ? 1 : 0)

    return (
      <div ref={ref} className="quotation-pad">
        <div className="pad-header-row">
          <div>GST No. : 37AMFPP7112D2Z7</div>
          <div className="pad-header-contact">
            <div>Cell : 9493203058, 9963326611</div>
            <div className="pad-email">Email : muralikrishnapathi@gmail.com</div>
          </div>
        </div>

        <div className="pad-brand">
          <h1 className="pad-title">SVLN WEIGHING SCALES</h1>
          <p className="pad-subtitle">
            We undertake to Deal &amp; Repair all types of Electronic Weighing
            Machines &amp; Weigh Bridges
          </p>
          <p className="pad-address">
            7-50, DUDDI VEEDHI, CHODAVARAM , Visakhapatnam,
            Andhra Pradesh, 531036
          </p>
        </div>

        {/* Fixed-height spacer: html2canvas ignores margins; PDF must not stretch layout */}
        <div className="pad-quotation-spacer" aria-hidden="true" />

        <div className="pad-center-box-wrap">
          <span className="pad-quotation-label">[ QUOTATION ]</span>
        </div>

        <div className="pad-meta-grid">
          <div>
            <span className="pad-meta-label">Ref:</span> SVLN/CDVM/{' '}
            {state.refNumber}
          </div>
          <div className="pad-meta-right">
            <span className="pad-meta-label">Date:</span>{' '}
            {formatDisplayDate(state.date)}
          </div>
        </div>

        <div className="pad-to-row">
          <span className="pad-to-label">To:</span>
          <div className="pad-to-content">{state.toAddress || '\u00A0'}</div>
        </div>

        <div className="pad-subject-row">
          <span className="pad-subject-label">Sub :</span>
          <span className="pad-subject-value">
            Quotation for the following Product : {state.productSubject}
          </span>
        </div>

        {filledItems.length > 0 && (
          <table
            className="pad-table pad-table-has-items"
            cellSpacing={0}
            cellPadding={0}
          >
            <colgroup>
              <col className="col-sno" />
              <col className="col-desc" />
              {showQty && <col className="col-qty" />}
              {showRate && <col className="col-rate" />}
              {showAmount && <col className="col-rs" />}
              {showAmount && <col className="col-ps" />}
            </colgroup>
            <thead>
              <tr>
                <th className="col-sno" rowSpan={showAmount ? 2 : 1}>
                  S.No.
                </th>
                <th className="col-desc" rowSpan={showAmount ? 2 : 1}>
                  DESCRIPTION
                </th>
                {showQty && (
                  <th className="col-qty" rowSpan={showAmount ? 2 : 1}>
                    Quantity
                  </th>
                )}
                {showRate && (
                  <th className="col-rate" rowSpan={showAmount ? 2 : 1}>
                    Rate per
                    <br />
                    Unit
                  </th>
                )}
                {showAmount && (
                  <th className="col-amount-head" colSpan={2}>
                    Amount
                  </th>
                )}
              </tr>
              {showAmount && (
                <tr>
                  <th className="col-rs">Rs.</th>
                  <th className="col-ps">Ps.</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filledItems.map((item, index) => {
                const amt = formatAmountParts(item.amountRs, item.amountPs)
                return (
                  <tr key={item.id}>
                    <td className="col-sno">{index + 1}</td>
                    <td className="col-desc">
                      <ItemDescription item={item} />
                    </td>
                    {showQty && (
                      <td className="col-qty">
                        {item.quantity > 0 ? item.quantity : ''}
                      </td>
                    )}
                    {showRate && (
                      <td className="col-rate">
                        {item.rate > 0 ? item.rate.toFixed(2) : ''}
                      </td>
                    )}
                    {showAmount && (
                      <>
                        <td className="col-rs">{amt.rs}</td>
                        <td className="col-ps">{amt.ps}</td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={totalLabelColSpan} className="pad-total-label">
                  TOTAL :
                </td>
                {showAmount && (
                  <>
                    <td className="col-rs">{totalFmt.rs}</td>
                    <td className="col-ps">{totalFmt.ps}</td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        )}

        <div className="pad-words-row">
          <span className="pad-words-label">Rupees (in words) :</span>
          <span className="pad-words-value">{state.totalRupeesWords}</span>
        </div>

        <h3 className="pad-terms-title">Terms &amp; Conditions :</h3>
        <table className="pad-terms-table" cellSpacing={0} cellPadding={0}>
          <tbody>
            <tr>
              <td className="pad-term-cell">
                <span className="pad-term-label">1) Sales Tax:</span>
                <span className="pad-term-value">
                  {state.salesTaxPercent} % Extra
                </span>
              </td>
              <td className="pad-term-cell">
                <span className="pad-term-label">5) Warranty:</span>
                <span className="pad-term-value">{state.warranty}</span>
              </td>
            </tr>
            <tr>
              <td className="pad-term-cell">
                <span className="pad-term-label">2) Packing &amp; Forwarding:</span>
                <span className="pad-term-value">
                  Rs. {state.packingForwarding} Extra
                </span>
              </td>
              <td className="pad-term-cell">
                <span className="pad-term-label">6) Payment:</span>
                <span className="pad-term-value">
                  {state.paymentAdvPercent}% Adv {state.paymentDeliveryPercent}%
                  Against Delivery
                </span>
              </td>
            </tr>
            <tr>
              <td className="pad-term-cell">
                <span className="pad-term-label">3) Installation Charges:</span>
                <span className="pad-term-value">
                  Rs. {state.installationCharges} Extra
                </span>
              </td>
              <td className="pad-term-cell">
                <span className="pad-term-label">7) Delivery:</span>
                <span className="pad-term-value">
                  Within {state.deliveryDays} days
                </span>
              </td>
            </tr>
            <tr>
              <td className="pad-term-cell">
                <span className="pad-term-label">4) Validity:</span>
                <span className="pad-term-value">{state.validityDays} days</span>
              </td>
              <td className="pad-term-cell">
                <span className="pad-term-label">8) Others:</span>
                <span className="pad-term-value">{state.others}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="pad-footer-text">
          We hope you will find our prices most reasonable confirming with the
          quality of product offers &amp; favour us with your valued order at an
          early date. Should you need any details please do write to us.
          Thanking you sir
        </p>

        <div className="pad-signature-row">
          <div className="pad-signature-left">
            <div>Encl :</div>
            <div>E &amp; O.E.</div>
          </div>
          <div className="pad-signature-right">
            <div className="pad-faithfully">
              Yours faithfully,
              <br />
              For SVLN WEIGHING SCALES
            </div>
            <div className="pad-signatory">Authorised Signatory</div>
          </div>
        </div>
      </div>
    )
  },
)
