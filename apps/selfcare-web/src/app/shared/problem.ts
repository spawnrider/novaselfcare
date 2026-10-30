import { HttpErrorResponse } from '@angular/common/http';

export interface UiProblem {
  kind: 'functional' | 'forbidden' | 'technical';
  message: string;
  code?: string;
}

/** Traduit une erreur HTTP (Problem RFC 9457) en message affichable. */
export function toUiProblem(err: unknown): UiProblem {
  const e = err instanceof HttpErrorResponse ? err : undefined;
  const body = (e?.error ?? {}) as { detail?: string; code?: string };
  if (e?.status === 403) return { kind: 'forbidden', message: body.detail ?? 'Droits insuffisants.', code: body.code };
  if (e && e.status >= 400 && e.status < 500) {
    return { kind: 'functional', message: body.detail ?? 'Action impossible.', code: body.code };
  }
  return {
    kind: 'technical',
    message: body.detail ?? 'Une erreur technique est survenue. Réessayez dans quelques instants.',
    code: body.code,
  };
}
