import { HttpResponse, delay } from 'msw';
import { SCENARIO_HEADER, ScenarioId, normalizeScenario } from '../../app/core/scenario.model';

/** Scénario porté par la requête (en-tête posé par scenarioInterceptor). */
export function scenarioOf(request: Request): ScenarioId {
  return normalizeScenario(request.headers.get(SCENARIO_HEADER)) ?? 'nominal';
}

export const SLOW_NETWORK_MS = 2500;

/** Latence simulée – appliquée à toutes les API métier en `slow-network`. */
export async function latency(scenario: ScenarioId): Promise<void> {
  if (scenario === 'slow-network') await delay(SLOW_NETWORK_MS);
}

type ProblemCode = 'OPTION_NOT_ELIGIBLE' | 'OPTION_ALREADY_ACTIVE' | 'FORBIDDEN' | 'TECHNICAL_ERROR';

/**
 * Réponse d'erreur conforme au schéma `Problem` du contrat.
 * À utiliser avec `throw` dans un override de handler généré (pattern documenté Orval/MSW).
 */
export function problem(status: number, code: ProblemCode, title: string, detail: string) {
  return HttpResponse.json(
    { type: `https://nova.example/problems/${code.toLowerCase().replace(/_/g, '-')}`, title, status, detail, code },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

export const technicalError = () =>
  problem(500, 'TECHNICAL_ERROR', 'Erreur technique', 'Le service est momentanément indisponible. Réessayez dans quelques instants.');

export const forbidden = () =>
  problem(403, 'FORBIDDEN', 'Droits insuffisants', 'Vous n’avez pas les droits nécessaires pour modifier cette option.');

export const notEligible = () =>
  problem(422, 'OPTION_NOT_ELIGIBLE', 'Option non disponible', 'Cette option n’est pas disponible pour votre contrat actuel.');

export const alreadyActive = () =>
  problem(409, 'OPTION_ALREADY_ACTIVE', 'Option déjà active', 'Cette option est déjà active sur votre contrat.');
