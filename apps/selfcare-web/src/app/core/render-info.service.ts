import { isPlatformServer } from '@angular/common';
import { Injectable, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';

interface RenderInfo {
  by: 'server' | 'client';
  at: string;
}
const KEY = makeStateKey<RenderInfo>('nova-render-info');

/** Indique, pour la démo, si le document initial a été produit en SSR ou en CSR. */
@Injectable({ providedIn: 'root' })
export class RenderInfoService {
  private readonly state = inject(TransferState);
  readonly initial: RenderInfo;

  constructor() {
    if (isPlatformServer(inject(PLATFORM_ID))) {
      this.initial = { by: 'server', at: new Date().toISOString() };
      this.state.set(KEY, this.initial);
    } else {
      this.initial = this.state.get(KEY, { by: 'client', at: new Date().toISOString() });
    }
  }
}
