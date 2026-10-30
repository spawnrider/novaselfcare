import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Accueil – Nova Selfcare', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage) },
  { path: 'billing', title: 'Factures & consommation – Nova Selfcare', loadComponent: () => import('./pages/billing/billing.page').then((m) => m.BillingPage) },
  { path: 'options', title: 'Mes options – Nova Selfcare', loadComponent: () => import('./pages/options/options.page').then((m) => m.OptionsPage) },
  { path: 'aide', title: 'Aide – Nova Selfcare', loadComponent: () => import('./pages/help/help.page').then((m) => m.HelpPage) },
  { path: '**', redirectTo: '' },
];
