/**
 * Jeux de données de démonstration.
 * Typés avec les modèles GÉNÉRÉS par Orval : si le contrat évolue (champ renommé,
 * enum modifiée…), ce fichier ne compile plus → le mock ne peut pas dériver du contrat.
 */
import type { BannerListResponse, FaqListResponse, HelpArticleListResponse, HomePageResponse } from '../app/api/cms/model';
import type { Contract, Customer } from '../app/api/customer/model';
import type { Invoice, NextInvoiceEstimate, UsageHistory, UsagePeriod, UsagePoint, UsageSummary } from '../app/api/billing/model';
import type { Option } from '../app/api/options/model';

// ---------- Customer ----------
export const customer: Customer = {
  id: 'CUS-000042',
  firstName: 'Clara',
  lastName: 'Martin',
  email: 'clara.martin@example.com',
  segment: 'standard',
  paymentStatus: 'up-to-date',
};

export const contracts: Contract[] = [
  {
    id: 'CTR-2024-0001',
    energy: 'electricity',
    status: 'active',
    offerName: 'Nova Électricité Verte',
    startDate: '2024-03-01',
    meterId: 'PDL-09876543210987',
  },
];

// ---------- Billing ----------
export const invoices: Invoice[] = [
  { id: 'INV-2026-09', issueDate: '2026-09-30', dueDate: '2026-10-15', amount: 79.4, currency: 'EUR', status: 'paid' },
  { id: 'INV-2026-08', issueDate: '2026-08-31', dueDate: '2026-09-15', amount: 71.85, currency: 'EUR', status: 'paid' },
  { id: 'INV-2026-07', issueDate: '2026-07-31', dueDate: '2026-08-15', amount: 68.1, currency: 'EUR', status: 'paid' },
  { id: 'INV-2026-06', issueDate: '2026-06-30', dueDate: '2026-07-15', amount: 70.3, currency: 'EUR', status: 'paid' },
  { id: 'INV-2026-05', issueDate: '2026-05-31', dueDate: '2026-06-15', amount: 82.0, currency: 'EUR', status: 'paid' },
  { id: 'INV-2026-04', issueDate: '2026-04-30', dueDate: '2026-05-15', amount: 95.6, currency: 'EUR', status: 'paid' },
];

export const latePaymentInvoices: Invoice[] = invoices.map((inv, i) =>
  i === 0 ? { ...inv, status: 'overdue' } : inv,
);

export const nextInvoice: NextInvoiceEstimate = { amount: 84.2, currency: 'EUR', expectedDate: '2026-10-31' };

// 12 derniers mois complets (oct. 2025 → sept. 2026), profil saisonnier
const MONTHLY_KWH = [402, 455, 498, 471, 430, 381, 334, 297, 271, 288, 312, 349];
const allPoints: UsagePoint[] = MONTHLY_KWH.map((kwh, i) => {
  const d = new Date(Date.UTC(2025, 9 + i, 1));
  return { month: d.toISOString().slice(0, 7), kwh };
});

const PERIOD_MONTHS: Record<UsagePeriod, number> = { '3m': 3, '6m': 6, '12m': 12 };

export function usageFor(period: UsagePeriod = '6m'): UsageHistory {
  return { period, unit: 'kWh', points: allPoints.slice(-PERIOD_MONTHS[period]) };
}

export const usageSummary: UsageSummary = { currentMonthKwh: 349, previousMonthKwh: 312, trendPercent: 12 };

// ---------- Options ----------
export const initialOptions: Option[] = [
  {
    id: 'e-invoice',
    label: 'Facture électronique',
    description: 'Recevez vos factures par e-mail, sans papier.',
    active: false,
    eligible: true,
    monthlyPrice: 0,
  },
  {
    id: 'usage-alert',
    label: 'Alerte consommation',
    description: 'Un SMS dès que votre consommation dépasse votre seuil.',
    active: true,
    eligible: true,
    monthlyPrice: 0,
  },
  {
    id: 'premium-support',
    label: 'Assistance premium',
    description: 'Un conseiller dédié, rappel sous 2 h ouvrées.',
    active: false,
    eligible: true,
    monthlyPrice: 3.99,
  },
];

// ---------- CMS (format Strapi 5) ----------
const doc = (id: number, documentId: string) => ({
  id,
  documentId,
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-10-01T08:00:00.000Z',
  publishedAt: '2026-10-01T08:00:00.000Z',
});
const meta = (total: number) => ({ pagination: { page: 1, pageSize: 25, pageCount: 1, total } });

export const homePage: HomePageResponse = {
  data: {
    ...doc(1, 'home0000000000000000000001'),
    title: 'Votre espace client Nova',
    greeting: 'Bonjour {firstName},',
    marketingText: 'Pilotez votre énergie en toute simplicité. (contenu mocké MSW)',
    helpTitle: 'Besoin d’aide ?',
    helpText: 'Nos conseillers vous répondent du lundi au samedi, de 8h à 20h.',
  },
  meta: {},
};

export const banners: BannerListResponse = {
  data: [
    {
      ...doc(1, 'bann0000000000000000000001'),
      title: 'Passez à la facture électronique',
      message: 'Activez l’option en un clic depuis votre espace.',
      variant: 'promo',
      ctaLabel: 'Découvrir',
      ctaUrl: '/options',
      priority: 1,
    },
  ],
  meta: meta(1),
};

export const helpArticles: HelpArticleListResponse = {
  data: [
    { ...doc(1, 'help0000000000000000000001'), title: 'Comprendre ma facture', slug: 'comprendre-ma-facture', summary: 'Les lignes de votre facture expliquées simplement.' },
    { ...doc(2, 'help0000000000000000000002'), title: 'Relever mon compteur', slug: 'relever-mon-compteur', summary: 'Où trouver votre index et comment le transmettre.' },
    { ...doc(3, 'help0000000000000000000003'), title: 'Réduire ma consommation', slug: 'reduire-ma-consommation', summary: 'Dix gestes simples pour alléger la facture.' },
  ],
  meta: meta(3),
};

export const faqs: FaqListResponse = {
  data: [
    { ...doc(1, 'faq00000000000000000000001'), question: 'Comment modifier mon RIB ?', answer: 'Rendez-vous dans Mon profil > Paiement.', order: 1 },
    { ...doc(2, 'faq00000000000000000000002'), question: 'Quand suis-je prélevé ?', answer: 'Le 15 de chaque mois, sauf mention contraire sur votre facture.', order: 2 },
  ],
  meta: meta(2),
};

/** PDF minimal valide (1 page, texte) pour le bouton « Télécharger ». */
export function invoicePdf(invoiceId: string): Blob {
  const text = `Nova Energie - Facture ${invoiceId} (document de demonstration)`;
  const stream = `BT /F1 14 Tf 72 760 Td (${text}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([body], { type: 'application/pdf' });
}
