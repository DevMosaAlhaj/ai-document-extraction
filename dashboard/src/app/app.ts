import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ExtractedInvoice {
  id: string;
  fileName: string;
  invoiceNumber: string;
  vendorName: string;
  invoiceDate: string;
  totalAmount: number;
  currency: string;
  lineItemCount: number;
  confidence: number;
  status: 'auto_inserted' | 'review_queued' | 'rejected';
  processedAt: string;
}

interface DailyStat {
  date: string;
  processed: number;
  autoInserted: number;
  reviewed: number;
  rejected: number;
  successRate: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  invoices = signal<ExtractedInvoice[]>([]);
  stats = signal<DailyStat | null>(null);
  activeTab = signal<'all' | 'inserted' | 'review' | 'rejected'>('all');
  loading = signal(true);

  totalProcessed = signal(0);
  autoInsertedCount = signal(0);
  reviewCount = signal(0);
  rejectedCount = signal(0);
  avgConfidence = signal(0);

  ngOnInit(): void {
    const now = new Date();
    const mockInvoices: ExtractedInvoice[] = [
      { id: '1', fileName: 'invoice_acme_2024.pdf', invoiceNumber: 'INV-2024-0847', vendorName: 'Acme Office Supplies', invoiceDate: '2024-03-15', totalAmount: 1372.25, currency: 'USD', lineItemCount: 4, confidence: 0.97, status: 'auto_inserted', processedAt: new Date(now.getTime() - 180000).toISOString() },
      { id: '2', fileName: 'receipt_techcorp.pdf', invoiceNumber: 'TC-INV-2234', vendorName: 'TechCorp Solutions', invoiceDate: '2024-03-14', totalAmount: 4250.00, currency: 'USD', lineItemCount: 2, confidence: 0.94, status: 'auto_inserted', processedAt: new Date(now.getTime() - 420000).toISOString() },
      { id: '3', fileName: 'PO_bluebind.pdf', invoiceNumber: 'BB-PO-0091', vendorName: 'BlueBind Logistics', invoiceDate: '2024-03-13', totalAmount: 890.50, currency: 'USD', lineItemCount: 6, confidence: 0.72, status: 'review_queued', processedAt: new Date(now.getTime() - 900000).toISOString() },
      { id: '4', fileName: 'scanned_receipt.jpg', invoiceNumber: 'INV-2024-0850', vendorName: 'Global Printing Co', invoiceDate: '2024-03-15', totalAmount: 567.80, currency: 'USD', lineItemCount: 3, confidence: 0.91, status: 'auto_inserted', processedAt: new Date(now.getTime() - 1500000).toISOString() },
      { id: '5', fileName: 'handwritten_invoice.png', invoiceNumber: '', vendorName: '', invoiceDate: '2024-03-14', totalAmount: 0, currency: 'USD', lineItemCount: 0, confidence: 0.23, status: 'rejected', processedAt: new Date(now.getTime() - 2400000).toISOString() },
      { id: '6', fileName: 'invoice_nexus_tech.pdf', invoiceNumber: 'NT-2024-0312', vendorName: 'Nexus Technologies', invoiceDate: '2024-03-12', totalAmount: 12890.00, currency: 'USD', lineItemCount: 8, confidence: 0.89, status: 'auto_inserted', processedAt: new Date(now.getTime() - 3600000).toISOString() },
      { id: '7', fileName: 'partial_invoice.pdf', invoiceNumber: 'PART-442', vendorName: 'Metro Services', invoiceDate: '2024-03-11', totalAmount: 340.00, currency: 'USD', lineItemCount: 2, confidence: 0.65, status: 'review_queued', processedAt: new Date(now.getTime() - 5400000).toISOString() },
      { id: '8', fileName: 'corrupt_scan.pdf', invoiceNumber: '', vendorName: 'Unknown Vendor', invoiceDate: '', totalAmount: 0, currency: 'USD', lineItemCount: 0, confidence: 0.12, status: 'rejected', processedAt: new Date(now.getTime() - 7200000).toISOString() },
      { id: '9', fileName: 'invoice_summit.pdf', invoiceNumber: 'SUM-2024-0078', vendorName: 'Summit Analytics', invoiceDate: '2024-03-10', totalAmount: 2150.00, currency: 'USD', lineItemCount: 5, confidence: 0.93, status: 'auto_inserted', processedAt: new Date(now.getTime() - 9000000).toISOString() },
      { id: '10', fileName: 'invoice_pinnacle.pdf', invoiceNumber: 'PIN-INV-552', vendorName: 'Pinnacle Hardware', invoiceDate: '2024-03-09', totalAmount: 678.40, currency: 'USD', lineItemCount: 3, confidence: 0.88, status: 'auto_inserted', processedAt: new Date(now.getTime() - 10800000).toISOString() },
    ];

    this.invoices.set(mockInvoices);
    this.totalProcessed.set(mockInvoices.length);
    this.autoInsertedCount.set(mockInvoices.filter(i => i.status === 'auto_inserted').length);
    this.reviewCount.set(mockInvoices.filter(i => i.status === 'review_queued').length);
    this.rejectedCount.set(mockInvoices.filter(i => i.status === 'rejected').length);
    const avg = mockInvoices.reduce((s, i) => s + i.confidence, 0) / mockInvoices.length;
    this.avgConfidence.set(Math.round(avg * 100));
    this.loading.set(false);
  }

  filteredInvoices(): ExtractedInvoice[] {
    const tab = this.activeTab();
    if (tab === 'all') return this.invoices();
    if (tab === 'inserted') return this.invoices().filter(i => i.status === 'auto_inserted');
    if (tab === 'review') return this.invoices().filter(i => i.status === 'review_queued');
    return this.invoices().filter(i => i.status === 'rejected');
  }

  setTab(tab: 'all' | 'inserted' | 'review' | 'rejected'): void {
    this.activeTab.set(tab);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'auto_inserted': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'review_queued': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'auto_inserted': return 'Auto-Inserted';
      case 'review_queued': return 'Review Queue';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.85) return 'text-emerald-400';
    if (confidence >= 0.5) return 'text-amber-400';
    return 'text-red-400';
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
