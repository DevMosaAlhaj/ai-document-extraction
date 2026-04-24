# AI-Powered Invoice & Document Extraction Pipeline

**n8n + OpenAI GPT-4o + Google Sheets**

Intelligent document processing pipeline that extracts structured data from invoices, receipts, and purchase orders using OpenAI's structured output API, then routes validated data to Google Sheets with human-review routing for low-confidence extractions.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Document Ingestion                           │
│                   (Gmail Attachments / Google Drive)                 │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      File Pre-Processing                            │
│         PDF → Image Conversion · Format Detection · Cleanup         │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  OpenAI GPT-4o Extraction                          │
│     Structured Output · Invoice Fields · Line Items · Tax           │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Validation Engine                                │
│     Checksum Verification · Deduplication · Confidence Score        │
└──────────┬───────────────────────┬─────────────────────────────────┘
           │                       │
    confidence ≥ 0.85       confidence < 0.85
           │                       │
           ▼                       ▼
┌─────────────────────┐  ┌─────────────────────┐
│   Google Sheets     │  │   Human Review      │
│   Auto-Insert       │  │   Slack Queue       │
└─────────────────────┘  └─────────────────────┘
           │                       │
           ▼                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Processing Summary                               │
│              Daily Digest · Error Log · Metrics                     │
└──────────────────────────────────────────────────────────────────────┘
```

## What It Does

1. **Ingest** — Monitors a Gmail inbox or Google Drive folder for new invoice PDFs/images
2. **Extract** — Sends documents to OpenAI GPT-4o with structured output schema for field extraction
3. **Validate** — Runs checksum verification, deduplication, and confidence scoring on extracted data
4. **Route** — High-confidence extractions go directly to Google Sheets; low-confidence goes to a Slack review queue
5. **Report** — Sends daily processing summaries with success rates and pending reviews

## Extracted Fields

| Field | Type | Example |
|-------|------|---------|
| invoice_number | string | `INV-2024-0847` |
| vendor_name | string | `Acme Office Supplies` |
| vendor_email | string | `billing@acme.com` |
| invoice_date | date | `2024-03-15` |
| due_date | date | `2024-04-14` |
| subtotal | number | `1,247.50` |
| tax_amount | number | `124.75` |
| total_amount | number | `1,372.25` |
| currency | string | `USD` |
| line_items | array | `[{description, quantity, unit_price, total}]` |
| payment_terms | string | `Net 30` |
| po_number | string | `PO-9923` |

## Alert Rules (configurable via .env)

| Rule | Condition | Action |
|------|-----------|--------|
| Duplicate Invoice | Same invoice_number already processed | Flag + skip auto-insert |
| Amount Mismatch | line_items sum ≠ subtotal | Route to human review |
| Future Date | invoice_date > today | Flag with warning |
| Missing Vendor | vendor_name is null/empty | Route to human review |
| High Value | total_amount > threshold | Slack notification + auto-insert |

## Setup

### 1. n8n Workflow

Import `workflow/ai-document-extraction.json` into your n8n instance.

### 2. Environment Variables

```bash
cp .env.example .env
```

### 3. Configure Credentials

- **OpenAI API** — Create API key at [platform.openai.com](https://platform.openai.com)
- **Google Sheets** — OAuth2 credentials with Sheets API scope
- **Gmail** — OAuth2 credentials with read-only scope (or use Google Drive)
- **Slack** — Webhook URL for review notifications

### 4. Google Sheets Setup

Create a Google Sheet with these column headers in row 1:

```
A: invoice_number | B: vendor_name | C: vendor_email | D: invoice_date | E: due_date | F: subtotal | G: tax_amount | H: total_amount | I: currency | J: payment_terms | K: po_number | L: line_items | M: confidence | N: processed_at
```

### 5. Dashboard

```bash
cd dashboard
npm install
npm start
# Open http://localhost:4200
```

## Monetization Potential

| Tier | Price | Features |
|------|-------|----------|
| Starter | $49/mo | 100 invoices/mo, email ingest, Sheets output |
| Business | $149/mo | 500 invoices/mo, multi-source ingest, ERP export |
| Enterprise | $399/mo | Unlimited, custom schemas, API access, priority |

## Tech Stack

- **n8n** — Workflow orchestration
- **OpenAI GPT-4o** — Structured document extraction
- **Google Sheets API** — Data storage
- **Gmail / Google Drive API** — Document ingestion
- **Slack** — Human review queue
- **Angular 21 + Tailwind** — Monitoring dashboard
