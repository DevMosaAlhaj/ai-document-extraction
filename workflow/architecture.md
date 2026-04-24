# Architecture: AI Document Extraction Pipeline

## Data Flow

```
Gmail/Drive ──► Poll Trigger (5min) ──► File Download ──► Format Check
                                                              │
                                                    ┌─────────┴─────────┐
                                                    │  Supported Type?  │
                                                    └────┬─────────┬───┘
                                                         │ Yes     │ No
                                                         ▼         ▼
                                               OpenAI Extract   Log Error
                                                         │
                                                         ▼
                                                  Validation Engine
                                                    ┌────┴────┐
                                                    │         │
                                              confidence   confidence
                                               ≥ 0.85      < 0.85
                                                    │         │
                                                    ▼         ▼
                                             Sheets Insert  Slack Review
                                                    │         │
                                                    ▼         ▼
                                              Log Success   Log Review
                                                    │
                                                    ▼
                                            Daily Summary Cron
```

## Node Inventory

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | Gmail Poll Trigger | Cron (5 min) | Checks inbox for new invoice emails |
| 2 | Drive Poll Trigger | Cron (5 min) | Checks folder for new uploaded files |
| 3 | Merge Sources | Merge | Combines Gmail and Drive ingestion streams |
| 4 | Download Attachment | HTTP Request | Downloads file from source |
| 5 | File Type Check | Switch | Routes PDFs vs images vs unsupported |
| 6 | PDF to Image | HTTP Request (external) | Converts PDF pages to images for GPT-4o |
| 7 | OpenAI Extract | OpenAI | Structured extraction with JSON schema |
| 8 | Parse Response | Set | Parses OpenAI structured output |
| 9 | Checksum Verify | Code | Validates line_items sum matches total |
| 10 | Duplicate Check | Google Sheets | Looks up invoice_number in existing rows |
| 11 | Confidence Score | Switch | Routes by extraction confidence level |
| 12 | Insert to Sheets | Google Sheets | Appends validated row to spreadsheet |
| 13 | Route to Review | Slack | Sends extraction to review queue |
| 14 | Log Processing | Google Sheets | Appends to processing log sheet |
| 15 | Daily Summary | Cron (9am) | Generates daily stats digest |
| 16 | Send Summary | Slack/Email | Delivers daily processing report |

## OpenAI Structured Output Schema

```json
{
  "type": "object",
  "properties": {
    "invoice_number": { "type": "string" },
    "vendor_name": { "type": "string" },
    "vendor_email": { "type": "string" },
    "invoice_date": { "type": "string", "format": "date" },
    "due_date": { "type": "string", "format": "date" },
    "subtotal": { "type": "number" },
    "tax_amount": { "type": "number" },
    "total_amount": { "type": "number" },
    "currency": { "type": "string" },
    "payment_terms": { "type": "string" },
    "po_number": { "type": "string" },
    "line_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
          "quantity": { "type": "number" },
          "unit_price": { "type": "number" },
          "total": { "type": "number" }
        }
      }
    },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  },
  "required": ["invoice_number", "vendor_name", "total_amount", "currency"]
}
```

## Error Handling

| Scenario | Response | Recovery |
|----------|----------|----------|
| Unsupported file type | Skip + log | Notify sender |
| OpenAI API failure | Retry 3x with backoff | Queue for later |
| Partial extraction | Route to review | Human fills gaps |
| Duplicate invoice | Skip + flag | Alert in digest |
| Sheets API error | Retry + queue | Process next poll |
| File too large (>10MB) | Skip + log | Alert admin |
