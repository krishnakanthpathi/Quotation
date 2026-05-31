# SVLN Quotation Generator

Single-page web app to fill out a quotation for **SVLN WEIGHING SCALES** and download a PDF that matches the physical quotation pad layout.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (form UI)
- jsPDF + html2canvas (PDF export)
- Google Gemini (AI auto-fill)

## Commands

```bash
npm install
npm run dev
npm run build
```

## AI auto-fill (optional)

Paste free-text quotation details and click **Auto-fill Form with AI** (uses **Google Gemini**).

1. Create `.env` from `.env.example` and set your key:
   ```bash
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```
2. Or paste the key in the app (saved for the browser session only).

Get a key from [Google AI Studio](https://aistudio.google.com/apikey). Never commit `.env` to git.

## Features

- Multiple scale line items (add/remove rows)
- Auto-calculated amount (Rs/Ps) per row and table TOTAL (subtotal)
- Grand total summary includes sales tax, packing & forwarding, and installation
- Live A4 preview and off-screen full-size export for accurate PDF capture
- AI auto-fill from pasted text (Gemini)
- Password lock and localStorage draft save
