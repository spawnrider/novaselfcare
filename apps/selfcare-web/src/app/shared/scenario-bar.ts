import { Component, computed, inject } from '@angular/core';
import { SCENARIOS, ScenarioId } from '../core/scenario.model';
import { ScenarioService } from '../core/scenario.service';

/** Barre de pilotage des scénarios MSW (visible uniquement quand l'API métier est mockée). */
@Component({
  selector: 'nova-scenario-bar',
  template: `
    <div class="scenario-bar" role="region" aria-label="Scénario de démonstration">
      <span class="tag">MSW</span>
      <label>
        Scénario
        <select [value]="scenario.current()" (change)="select($any($event.target).value)">
          @for (s of scenarios; track s.id) {
            <option [value]="s.id">{{ s.label }}</option>
          }
        </select>
      </label>
      <span class="hint">{{ hint() }}</span>
      <code class="hint">?scenario={{ scenario.current() }}</code>
    </div>
  `,
})
export class ScenarioBar {
  protected readonly scenario = inject(ScenarioService);
  protected readonly scenarios = SCENARIOS;
  protected readonly hint = computed(() => SCENARIOS.find((s) => s.id === this.scenario.current())?.hint);

  protected select(id: ScenarioId) {
    this.scenario.set(id);
  }
}
