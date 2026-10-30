import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { RenderInfoService } from './core/render-info.service';
import { RUNTIME_CONFIG, executionMode } from './core/runtime-config';
import { ScenarioBar } from './shared/scenario-bar';

@Component({
  selector: 'nova-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe, ScenarioBar],
  template: `
    <header class="topbar">
      <a routerLink="/" class="brand"><span class="logo">N</span> Nova <strong>Selfcare</strong></a>
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
        <a routerLink="/billing" routerLinkActive="active">Factures</a>
        <a routerLink="/options" routerLinkActive="active">Options</a>
        <a routerLink="/aide" routerLinkActive="active">Aide</a>
      </nav>
      <span class="mode" [attr.data-mode]="mode">{{ mode }}</span>
    </header>

    @if (mocksEnabled) {
      <nova-scenario-bar />
    }

    <main class="container">
      <router-outlet />
    </main>

    <footer class="footer">
      @if (isInitialPage()) {
        Document rendu côté
        <strong>{{ render.initial.by === 'server' ? 'serveur (SSR/prerender)' : 'navigateur (CSR)' }}</strong>
        à {{ render.initial.at | date: 'HH:mm:ss' }}
      } @else {
        Page rendue côté <strong>navigateur</strong> (navigation client)
      }
      · API métier : {{ config.apiMode }} · CMS : {{ config.cmsMode }}
    </footer>
  `,
})
export class App {
  protected readonly config = inject(RUNTIME_CONFIG);
  protected readonly render = inject(RenderInfoService);
  protected readonly mode = executionMode(this.config);
  protected readonly mocksEnabled = this.config.apiMode === 'mock';

  private readonly router = inject(Router);
  private readonly navCount = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((_, i) => i + 1),
    ),
    { initialValue: 0 },
  );
  protected readonly isInitialPage = computed(() => this.navCount() <= 1);
}
