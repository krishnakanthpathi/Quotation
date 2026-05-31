# SVLN Quotation Generator

Single-page web app to fill out a quotation for **SVLN WEIGHING SCALES** and download a PDF that matches the physical quotation pad layout.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (form UI)
- jsPDF + html2canvas (PDF export)

## Commands

```bash
npm install
npm run dev
npm run build
```

Open the dev server URL, enter quotation details on the left, preview on the right, then click **Download PDF**.

## Features

- Multiple scale line items (add/remove rows)
- Auto-calculated amount (Rs/Ps) per row and table TOTAL (subtotal)
- Grand total summary includes sales tax, packing & forwarding, and installation
- Live A4 preview and off-screen full-size export for accurate PDF capture
# Quotation
