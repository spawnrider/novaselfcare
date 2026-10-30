import type { Option } from '../app/api/options/model';
import { initialOptions } from './fixtures';

/**
 * Mini « base » en mémoire pour les parcours transactionnels.
 * Navigateur : réinitialisée à chaque rechargement de page.
 * Node (SSR) : partagée par le process – d'où le rendu CSR de /options.
 */
let options: Option[] = structuredClone(initialOptions);
let caseSeq = 31337;

export const db = {
  options: () => options,
  setActive(id: string, active: boolean): Option | undefined {
    const opt = options.find((o) => o.id === id);
    if (opt) opt.active = active;
    return opt;
  },
  nextCaseId: () => `CASE-${caseSeq++}`,
  reset() {
    options = structuredClone(initialOptions);
    caseSeq = 31337;
  },
};
