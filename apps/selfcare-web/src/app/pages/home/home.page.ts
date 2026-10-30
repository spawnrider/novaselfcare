import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
// Clients générés par Orval
import { BillingService } from '../../api/billing/billing/billing.service';
import { CmsService } from '../../api/cms/cms/cms.service';
import { CustomerService } from '../../api/customer/customer/customer.service';
import { ScenarioService } from '../../core/scenario.service';
import { Skeleton } from '../../shared/skeleton';

const ENERGY_LABEL = { electricity: 'Électricité', gas: 'Gaz' } as const;

/**
 * Page 1 – Accueil (SSR).
 * CMS + API métier sont appelés pendant le rendu serveur ; la réponse est transférée
 * au navigateur (HttpTransferCache) : aucun double appel à l'hydratation.
 */
@Component({
  selector: 'nova-home-page',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, Skeleton],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly customerApi = inject(CustomerService);
  private readonly billingApi = inject(BillingService);
  private readonly cmsApi = inject(CmsService);
  private readonly scenario = inject(ScenarioService).current;

  // --- Éditorial (CMS) : indépendant du scénario métier
  readonly home = rxResource({ stream: () => this.cmsApi.homePage() });
  readonly banners = rxResource({ stream: () => this.cmsApi.listBanners() });

  // --- Métier : rechargé à chaque changement de scénario
  readonly customer = rxResource({ params: this.scenario, stream: () => this.customerApi.currentCustomer() });
  readonly contracts = rxResource({ params: this.scenario, stream: () => this.customerApi.listContracts() });
  readonly next = rxResource({ params: this.scenario, stream: () => this.billingApi.nextInvoiceEstimate() });
  readonly usage = rxResource({ params: this.scenario, stream: () => this.billingApi.usageSummary() });

  readonly greeting = computed(() => {
    const tpl = this.home.hasValue() ? this.home.value().data.greeting : 'Bonjour {firstName},';
    const name = this.customer.hasValue() ? this.customer.value().firstName : '';
    return tpl.replace('{firstName}', name);
  });

  readonly mainContract = computed(() => (this.contracts.hasValue() ? this.contracts.value()[0] : undefined));
  readonly energyLabel = computed(() => {
    const c = this.mainContract();
    return c ? ENERGY_LABEL[c.energy] : '';
  });

  readonly sortedBanners = computed(() =>
    this.banners.hasValue() ? [...this.banners.value().data].sort((a, b) => a.priority - b.priority) : [],
  );
}
