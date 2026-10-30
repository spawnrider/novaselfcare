import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { BillingService } from '../../api/billing/billing/billing.service';
import type { Invoice, UsagePeriod } from '../../api/billing/model';
import { ScenarioService } from '../../core/scenario.service';
import { toUiProblem } from '../../shared/problem';
import { Skeleton } from '../../shared/skeleton';

const STATUS_LABEL: Record<Invoice['status'], string> = { paid: 'Payée', due: 'À payer', overdue: 'En retard' };

/** Page 2 – Factures & consommation (CSR, MSW Service Worker). */
@Component({
  selector: 'nova-billing-page',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, Skeleton],
  templateUrl: './billing.page.html',
})
export class BillingPage {
  private readonly api = inject(BillingService);
  private readonly scenario = inject(ScenarioService).current;

  readonly periods: { id: UsagePeriod; label: string }[] = [
    { id: '3m', label: '3 mois' },
    { id: '6m', label: '6 mois' },
    { id: '12m', label: '12 mois' },
  ];
  readonly period = signal<UsagePeriod>('6m');
  readonly statusLabel = STATUS_LABEL;

  readonly invoices = rxResource({ params: this.scenario, stream: () => this.api.listInvoices() });
  readonly usage = rxResource({
    params: () => ({ period: this.period(), scenario: this.scenario() }),
    stream: ({ params }) => this.api.usageHistory({ period: params.period }),
  });

  readonly downloading = signal<string | null>(null);
  readonly downloadError = signal<string | null>(null);

  /** Barres du graphique (SVG natif, aucune librairie). */
  readonly bars = computed(() => {
    if (!this.usage.hasValue()) return [];
    const points = this.usage.value().points;
    const max = Math.max(1, ...points.map((p) => p.kwh));
    return points.map((p) => ({
      ...p,
      h: (p.kwh / max) * 100,
      label: new Date(`${p.month}-01T00:00:00Z`).toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' }),
    }));
  });

  readonly invoiceError = computed(() => (this.invoices.error() ? toUiProblem(this.invoices.error()) : null));

  download(invoice: Invoice) {
    this.downloading.set(invoice.id);
    this.downloadError.set(null);
    this.api.downloadInvoice(invoice.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const a = Object.assign(document.createElement('a'), { href: url, download: `${invoice.id}.pdf` });
        a.click();
        URL.revokeObjectURL(url);
        this.downloading.set(null);
      },
      error: (err) => {
        this.downloadError.set(toUiProblem(err).message);
        this.downloading.set(null);
      },
    });
  }
}
