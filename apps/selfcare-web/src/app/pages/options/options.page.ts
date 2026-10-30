import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { Option } from '../../api/options/model';
import { OptionsService } from '../../api/options/options/options.service';
import { SupportService } from '../../api/options/support/support.service';
import { ScenarioService } from '../../core/scenario.service';
import { UiProblem, toUiProblem } from '../../shared/problem';
import { Skeleton } from '../../shared/skeleton';

interface Feedback {
  optionId: string;
  kind: 'success' | UiProblem['kind'];
  message: string;
  code?: string;
}

/** Page 3 – Options & actions métier (CSR, parcours transactionnel mocké). */
@Component({
  selector: 'nova-options-page',
  imports: [CurrencyPipe, Skeleton],
  templateUrl: './options.page.html',
})
export class OptionsPage {
  private readonly optionsApi = inject(OptionsService);
  private readonly supportApi = inject(SupportService);
  private readonly scenario = inject(ScenarioService).current;

  readonly options = rxResource({ params: this.scenario, stream: () => this.optionsApi.listOptions() });
  readonly pending = signal<string | null>(null);
  readonly feedback = signal<Feedback | null>(null);
  readonly supportCase = signal<string | null>(null);

  toggle(option: Option) {
    this.pending.set(option.id);
    this.feedback.set(null);
    this.supportCase.set(null);
    const call = option.active
      ? this.optionsApi.unsubscribeOption(option.id)
      : this.optionsApi.subscribeOption(option.id);

    call.subscribe({
      next: (updated) => {
        this.options.update((list) => list?.map((o) => (o.id === updated.id ? updated : o)));
        this.feedback.set({
          optionId: option.id,
          kind: 'success',
          message: `${updated.label} ${updated.active ? 'activée' : 'désactivée'} avec succès.`,
        });
        this.pending.set(null);
      },
      error: (err) => {
        const p = toUiProblem(err);
        this.feedback.set({ optionId: option.id, ...p });
        this.pending.set(null);
      },
    });
  }

  contactSupport(optionId: string) {
    this.supportApi
      .createSupportCase({ topic: 'option', optionId, message: `Demande d’aide pour l’option ${optionId}` })
      .subscribe({
        next: (c) => this.supportCase.set(c.id),
        error: () => this.supportCase.set('indisponible'),
      });
  }
}
