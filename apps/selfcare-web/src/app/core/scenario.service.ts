import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, inject, signal } from '@angular/core';
import { RUNTIME_CONFIG } from './runtime-config';
import {
  SCENARIO_COOKIE,
  SCENARIO_STORAGE_KEY,
  ScenarioId,
  normalizeScenario,
} from './scenario.model';

/**
 * Scénario MSW actif, résolu de façon identique côté serveur et navigateur :
 *   ?scenario=…  >  localStorage('mswScenario')  >  cookie 'nova-scenario'  >  MSW_SCENARIO
 * Le cookie est la source lue par le SSR : il est toujours synchronisé pour éviter
 * un écart de rendu à l'hydratation.
 */
@Injectable({ providedIn: 'root' })
export class ScenarioService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly config = inject(RUNTIME_CONFIG);

  readonly current = signal<ScenarioId>(this.resolveInitial());

  set(id: ScenarioId): void {
    this.persist(id);
    this.current.set(id);
  }

  private resolveInitial(): ScenarioId {
    const fallback = normalizeScenario(this.config.defaultScenario) ?? 'nominal';

    if (!this.isBrowser) {
      const url = this.request ? new URL(this.request.url) : undefined;
      const cookie = readCookie(this.request?.headers.get('cookie') ?? '', SCENARIO_COOKIE);
      return normalizeScenario(url?.searchParams.get('scenario')) ?? normalizeScenario(cookie) ?? fallback;
    }

    const fromQuery = normalizeScenario(new URL(this.document.location.href).searchParams.get('scenario'));
    const fromStorage = normalizeScenario(safeStorage()?.getItem(SCENARIO_STORAGE_KEY));
    const fromCookie = normalizeScenario(readCookie(this.document.cookie, SCENARIO_COOKIE));
    const resolved = fromQuery ?? fromStorage ?? fromCookie ?? fallback;
    if (resolved !== fromCookie || fromQuery) this.persist(resolved);
    return resolved;
  }

  private persist(id: ScenarioId): void {
    if (!this.isBrowser) return;
    safeStorage()?.setItem(SCENARIO_STORAGE_KEY, id);
    this.document.cookie = `${SCENARIO_COOKIE}=${id}; Path=/; SameSite=Lax; Max-Age=86400`;
  }
}

function readCookie(header: string, name: string): string | undefined {
  return header
    .split(';')
    .map((p) => p.trim().split('='))
    .find(([k]) => k === name)?.[1];
}

function safeStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
