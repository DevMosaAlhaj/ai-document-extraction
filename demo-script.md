# Demo Script: AI Document Extraction Pipeline

**Target**: 3-4 minute Loom walkthrough

---

## Opening (15 seconds)

"Hey, I'm Mosa Ahmad — Integration Engineer. This is an AI-powered document extraction pipeline built with n8n and OpenAI that turns messy invoice PDFs into structured spreadsheet data in seconds."

## 1. The Problem (30 seconds)

- Show a real invoice PDF — messy layout, handwritten notes, multiple pages
- "Businesses process 20-50 invoices per week. Manual data entry takes 5-15 minutes per invoice with a 3-8% error rate. That's 2-12 hours of pure data entry weekly."

## 2. The Dashboard (45 seconds)

- Open the Angular dashboard at localhost:4200
- Point out the stats: documents processed, success rate, confidence distribution
- Show the processed invoices table with extracted fields
- Highlight the review queue — low-confidence extractions waiting for human approval

## 3. Live Extraction (60 seconds)

- Drop a test invoice into the Google Drive folder
- Switch to n8n editor — show the execution triggering in real-time
- Walk through the flow: Ingest → Extract → Validate → Route
- Show the OpenAI node configuration and structured output schema
- Switch back to dashboard — the new invoice appears in the processed list

## 4. Human Review Flow (30 seconds)

- Show a low-confidence extraction in the review queue
- Explain the confidence threshold (0.85) and why some invoices need review
- Show the Slack notification that flags items for review

## 5. Daily Summary (20 seconds)

- Show the daily digest format: processed count, success rate, pending reviews
- Explain the automated reporting

## 6. The n8n Workflow (30 seconds)

- Switch to n8n editor — zoom out to show the full workflow
- Highlight key nodes: dual ingestion (Gmail + Drive), OpenAI extraction, validation engine, routing logic
- Show the error handling paths

## Closing (15 seconds)

"This processes 100+ invoices per week with less than 1% error rate. The full source code is on my GitHub — link in the description. If you need a custom document processing pipeline, reach out."

---

## Screenshots Checklist

- [ ] Dashboard overview with stats
- [ ] Processed invoices table
- [ ] Review queue with flagged items
- [ ] n8n workflow editor (full view)
- [ ] OpenAI structured output node config
- [ ] Google Sheets output with extracted data
- [ ] Slack review notification
- [ ] Daily summary report
