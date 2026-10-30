/**
 * Catalogue des scénarios de démonstration.
 * Partagé entre l'application (sélecteur, intercepteur) et les mocks MSW (handlers).
 */
export const SCENARIO_HEADER = 'x-nova-scenario';
export const SCENARIO_STORAGE_KEY = 'mswScenario';
export const SCENARIO_COOKIE = 'nova-scenario';

export const SCENARIOS = [
  { id: 'nominal', label: 'Nominal', hint: 'Contrat actif, factures, consommation +12 %' },
  { id: 'empty-state', label: 'Aucune facture', hint: 'Nouveau client : listes vides' },
  { id: 'slow-network', label: 'Réseau lent', hint: '+2,5 s sur chaque appel métier' },
  { id: 'server-error', label: 'Erreur serveur', hint: 'HTTP 500 sur factures, conso et actions' },
  { id: 'late-payment', label: 'Retard de paiement', hint: 'Dernière facture impayée' },
  { id: 'functional-error', label: 'Client non éligible', hint: 'HTTP 422 à l’activation d’une option' },
  { id: 'forbidden', label: 'Droits insuffisants', hint: 'HTTP 403 sur les actions' },
] as const;

export type ScenarioId = (typeof SCENARIOS)[number]['id'];

/** Alias acceptés (noms utilisés dans le cahier de démo). */
const ALIASES: Record<string, ScenarioId> = {
  success: 'nominal',
  empty: 'empty-state',
  'no-invoice': 'empty-state',
  slow: 'slow-network',
  error: 'server-error',
  'technical-error': 'server-error',
};

export function normalizeScenario(value: string | null | undefined): ScenarioId | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (SCENARIOS.some((s) => s.id === v)) return v as ScenarioId;
  return ALIASES[v];
}
