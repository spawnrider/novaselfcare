import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CmsService } from '../../api/cms/cms/cms.service';

/**
 * Page « Aide » – 100 % éditoriale, PRERENDER au build.
 * En HYBRID le contenu vient de Strapi ; en MOCK_FULL du mock CMS (MSW Node pendant le build).
 */
@Component({
  selector: 'nova-help-page',
  template: `
    <h1>Centre d’aide</h1>
    <section class="grid">
      @for (a of articles(); track a.documentId) {
        <article class="card">
          <h2>{{ a.title }}</h2>
          <p>{{ a.summary }}</p>
        </article>
      } @empty {
        @if (help.error()) {
          <p class="error">Contenu indisponible.</p>
        }
      }
    </section>
    <section class="card">
      <h2>Questions fréquentes</h2>
      @for (f of faqs(); track f.documentId) {
        <details>
          <summary>{{ f.question }}</summary>
          <p>{{ f.answer }}</p>
        </details>
      }
    </section>
  `,
})
export class HelpPage {
  private readonly cms = inject(CmsService);
  readonly help = rxResource({ stream: () => this.cms.listHelpArticles() });
  readonly faq = rxResource({ stream: () => this.cms.listFaqs() });
  readonly articles = computed(() => (this.help.hasValue() ? this.help.value().data : []));
  readonly faqs = computed(() =>
    this.faq.hasValue() ? [...this.faq.value().data].sort((a, b) => a.order - b.order) : [],
  );
}
