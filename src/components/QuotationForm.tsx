import type { ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { UseQuotationFormReturn } from '../hooks/useQuotationForm'
import { computeLineItem } from '../utils/calculations'

interface QuotationFormProps {
  form: UseQuotationFormReturn
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {children}
    </label>
  )
}

const inputClass = 'w-full p-2 border border-gray-300 rounded-md'

export function QuotationForm({ form }: QuotationFormProps) {
  const { state, computed, updateField, updateLineItem, addLineItem, removeLineItem } =
    form

  return (
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm h-full overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Quotation Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="refNumber">Ref Number</FieldLabel>
            <input
              id="refNumber"
              className={inputClass}
              value={state.refNumber}
              onChange={(e) => updateField('refNumber', e.target.value)}
              placeholder="SVLN/VSP/..."
            />
          </div>
          <div>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <input
              id="date"
              type="date"
              className={inputClass}
              value={state.date}
              onChange={(e) => updateField('date', e.target.value)}
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <FieldLabel htmlFor="toAddress">To Address</FieldLabel>
            <textarea
              id="toAddress"
              className={`${inputClass} h-24`}
              value={state.toAddress}
              onChange={(e) => updateField('toAddress', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="quotationNo">Quotation No</FieldLabel>
            <input
              id="quotationNo"
              className={inputClass}
              value={state.quotationNo}
              onChange={(e) => updateField('quotationNo', e.target.value)}
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <FieldLabel htmlFor="productSubject">Subject Product</FieldLabel>
            <input
              id="productSubject"
              className={inputClass}
              value={state.productSubject}
              onChange={(e) => updateField('productSubject', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Products</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="space-y-6">
          {state.lineItems.map((item) => {
            const computedItem = computeLineItem(item)
            return (
              <div
                key={item.id}
                className="p-4 border border-gray-200 rounded-lg relative bg-gray-50"
              >
                {state.lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mr-8">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Make
                    </label>
                    <input
                      className={`${inputClass} text-sm`}
                      value={item.make}
                      onChange={(e) =>
                        updateLineItem(item.id, { make: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Model
                    </label>
                    <input
                      className={`${inputClass} text-sm`}
                      value={item.model}
                      onChange={(e) =>
                        updateLineItem(item.id, { model: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Capacity
                    </label>
                    <input
                      className={`${inputClass} text-sm`}
                      value={item.capacity}
                      onChange={(e) =>
                        updateLineItem(item.id, { capacity: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Accuracy
                    </label>
                    <input
                      className={`${inputClass} text-sm`}
                      value={item.accuracy}
                      onChange={(e) =>
                        updateLineItem(item.id, { accuracy: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Type
                    </label>
                    <input
                      className={`${inputClass} text-sm`}
                      value={item.type}
                      onChange={(e) =>
                        updateLineItem(item.id, { type: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Accessories
                    </label>
                    <div className="flex flex-wrap gap-4 mb-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.accessoryExtraDisplay}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              accessoryExtraDisplay: e.target.checked,
                            })
                          }
                        />
                        Extra Display
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.accessoryBatteryBackup}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              accessoryBatteryBackup: e.target.checked,
                            })
                          }
                        />
                        Battery Backup
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.accessoryWindShield}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              accessoryWindShield: e.target.checked,
                            })
                          }
                        />
                        Wind Shield
                      </label>
                    </div>
                    <input
                      className={`${inputClass} text-sm`}
                      placeholder="Other accessories"
                      value={item.accessoriesOther}
                      onChange={(e) =>
                        updateLineItem(item.id, {
                          accessoriesOther: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      className={`${inputClass} text-sm`}
                      value={item.quantity || ''}
                      onChange={(e) =>
                        updateLineItem(item.id, {
                          quantity: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Rate
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={`${inputClass} text-sm`}
                      value={item.rate || ''}
                      onChange={(e) =>
                        updateLineItem(item.id, {
                          rate: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Amount:</span>
                      <span>
                        Rs. {computedItem.amountRs}.
                        {String(computedItem.amountPs).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <strong>Grand total (incl. tax, P&amp;F, installation):</strong> Rs.{' '}
          {computed.totals.grandTotalRs}.
          {String(computed.totals.grandTotalPs).padStart(2, '0')}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Terms &amp; Totals</h3>
        <div className="space-y-4">
          <div>
            <FieldLabel htmlFor="totalRupeesWords">
              Total Rupees (in words)
            </FieldLabel>
            <input
              id="totalRupeesWords"
              className={inputClass}
              value={state.totalRupeesWords}
              onChange={(e) => updateField('totalRupeesWords', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="salesTaxPercent">1) Sales Tax (%)</FieldLabel>
              <input
                id="salesTaxPercent"
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={state.salesTaxPercent || ''}
                onChange={(e) =>
                  updateField('salesTaxPercent', Number(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="warranty">5) Warranty</FieldLabel>
              <input
                id="warranty"
                className={inputClass}
                value={state.warranty}
                onChange={(e) => updateField('warranty', e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="packingForwarding">
                2) Packing &amp; Forwarding (Rs)
              </FieldLabel>
              <input
                id="packingForwarding"
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={state.packingForwarding || ''}
                onChange={(e) =>
                  updateField('packingForwarding', Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <FieldLabel htmlFor="paymentAdvPercent">
                  6) Payment Adv (%)
                </FieldLabel>
                <input
                  id="paymentAdvPercent"
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={state.paymentAdvPercent || ''}
                  onChange={(e) =>
                    updateField('paymentAdvPercent', Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="w-1/2">
                <FieldLabel htmlFor="paymentDeliveryPercent">
                  Delivery (%)
                </FieldLabel>
                <input
                  id="paymentDeliveryPercent"
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={state.paymentDeliveryPercent || ''}
                  onChange={(e) =>
                    updateField(
                      'paymentDeliveryPercent',
                      Number(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="installationCharges">
                3) Installation Charges (Rs)
              </FieldLabel>
              <input
                id="installationCharges"
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={state.installationCharges || ''}
                onChange={(e) =>
                  updateField('installationCharges', Number(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="deliveryDays">7) Delivery (Days)</FieldLabel>
              <input
                id="deliveryDays"
                type="number"
                min={0}
                className={inputClass}
                value={state.deliveryDays || ''}
                onChange={(e) =>
                  updateField('deliveryDays', Number(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="validityDays">4) Validity (Days)</FieldLabel>
              <input
                id="validityDays"
                type="number"
                min={0}
                className={inputClass}
                value={state.validityDays || ''}
                onChange={(e) =>
                  updateField('validityDays', Number(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="others">8) Others</FieldLabel>
              <input
                id="others"
                className={inputClass}
                value={state.others}
                onChange={(e) => updateField('others', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
