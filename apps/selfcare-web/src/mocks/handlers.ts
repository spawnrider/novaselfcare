/**
 * Handlers MSW de la démo = handlers GÉNÉRÉS par Orval + comportements de scénario.
 *
 * On n'écrit aucune route à la main : chaque `get<Operation>MockHandler` vient du contrat
 * (méthode, chemin, types de params/body/réponse). On ne fournit que la DONNÉE et
 * le COMPORTEMENT (latence, erreurs, état) via l'override typé.
 *
 * Les mêmes handlers servent : MSW Node (SSR + prerender), MSW Service Worker (CSR), tests Vitest.
 */
import type { RequestHandler } from 'msw';
import {
  getDownloadInvoiceMockHandler,
  getListInvoicesMockHandler,
  getNextInvoiceEstimateMockHandler,
  getUsageHistoryMockHandler,
  getUsageSummaryMockHandler,
} from '../app/api/billing/billing/billing.msw';
import {
  getHomePageMockHandler,
  getListBannersMockHandler,
  getListFaqsMockHandler,
  getListHelpArticlesMockHandler,
} from '../app/api/cms/cms/cms.msw';
import { getCurrentCustomerMockHandler, getListContractsMockHandler } from '../app/api/customer/customer/customer.msw';
import type { UsagePeriod } from '../app/api/billing/model';
import {
  getListOptionsMockHandler,
  getSubscribeOptionMockHandler,
  getUnsubscribeOptionMockHandler,
} from '../app/api/options/options/options.msw';
import { getCreateSupportCaseMockHandler } from '../app/api/options/support/support.msw';
import { db } from './db';
import * as fx from './fixtures';
import { alreadyActive, forbidden, latency, notEligible, scenarioOf, technicalError } from './scenarios';

const idParam = (params: Record<string, string | readonly string[] | undefined>): string => String(params['id']);

// ------------------------------------------------------------------ Customer
const customerHandlers = (): RequestHandler[] => [
  getCurrentCustomerMockHandler(async ({ request }) => {
    const s = scenarioOf(request);
    await latency(s);
    return s === 'late-payment' ? { ...fx.customer, paymentStatus: 'late' } : fx.customer;
  }),
  getListContractsMockHandler(async ({ request }) => {
    await latency(scenarioOf(request));
    return fx.contracts;
  }),
];

// ------------------------------------------------------------------- Billing
const billingHandlers = (): RequestHandler[] => [
  getListInvoicesMockHandler(async ({ request }) => {
    const s = scenarioOf(request);
    await latency(s);
    if (s === 'server-error') throw technicalError();
    if (s === 'empty-state') return [];
    if (s === 'late-payment') return fx.latePaymentInvoices;
    return fx.invoices;
  }),
  getDownloadInvoiceMockHandler(async ({ request, params }) => {
    const s = scenarioOf(request);
    await latency(s);
    if (s === 'server-error') throw technicalError();
    return fx.invoicePdf(idParam(params));
  }),
  getNextInvoiceEstimateMockHandler(async ({ request }) => {
    const s = scenarioOf(request);
    await latency(s);
    if (s === 'server-error') throw technicalError();
    return fx.nextInvoice;
  }),
  getUsageHistoryMockHandler(async ({ request }) => {
    const s = scenarioOf(request);
    await latency(s);
    if (s === 'server-error') throw technicalError();
    const period = (new URL(request.url).searchParams.get('period') ?? '6m') as UsagePeriod;
    const usage = fx.usageFor(period);
    return s === 'empty-state' ? { ...usage, points: [] } : usage;
  }),
  getUsageSummaryMockHandler(async ({ request }) => {
    const s = scenarioOf(request);
    await latency(s);
    if (s === 'server-error') throw technicalError();
    if (s === 'empty-state') return { currentMonthKwh: 0, previousMonthKwh: 0, trendPercent: 0 };
    return fx.usageSummary;
  }),
];

// ------------------------------------------------------- Options & Support
const optionsHandlers = (): RequestHandler[] => [
  getListOptionsMockHandler(async ({ request }) => {
    await latency(scenarioOf(request));
    return db.options();
  }),
  getSubscribeOptionMockHandler(async ({ request, params }) => {
    const s = scenarioOf(request);
    await latency(s);
    if (s === 'server-error') throw technicalError();
    if (s === 'forbidden') throw forbidden();
    if (s === 'functional-error') throw notEligible();
    const current = db.options().find((o) => o.id === idParam(params));
    if (!current) throw technicalError();
    if (current.active) throw alreadyActive();
    return db.setActive(idParam(params), true)!;
  }),
  getUnsubscribeOptionMockHandler(async ({ request, params }) => {
    const s = scenarioOf(request);
    await latency(s);
    if (s === 'server-error') throw technicalError();
    if (s === 'forbidden') throw forbidden();
    const updated = db.setActive(idParam(params), false);
    if (!updated) throw technicalError();
    return updated;
  }),
  getCreateSupportCaseMockHandler(async ({ request }) => {
    await latency(scenarioOf(request));
    return { id: db.nextCaseId(), status: 'open', createdAt: new Date().toISOString() };
  }),
];

// ----------------------------------------------------------------------- CMS
// Le CMS n'est pas piloté par scénario : en HYBRID, il est remplacé par Strapi réel.
const cmsHandlers = (): RequestHandler[] => [
  getHomePageMockHandler(fx.homePage),
  getListBannersMockHandler(fx.banners),
  getListHelpArticlesMockHandler(fx.helpArticles),
  getListFaqsMockHandler(fx.faqs),
];

export interface MockScope {
  /** API métier (customer, billing, options, support) */
  business: boolean;
  /** API éditoriale (CMS) – false en HYBRID */
  cms: boolean;
}

export function buildHandlers(scope: MockScope): RequestHandler[] {
  return [
    ...(scope.business ? [...customerHandlers(), ...billingHandlers(), ...optionsHandlers()] : []),
    ...(scope.cms ? cmsHandlers() : []),
  ];
}
