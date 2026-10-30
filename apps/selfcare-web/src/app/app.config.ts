import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideApiBaseUrls } from './core/api-base-urls';
import { scenarioInterceptor } from './core/scenario.interceptor';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay()),
    // withFetch : côté serveur, HttpClient passe par le fetch global… intercepté par MSW Node
    provideHttpClient(withFetch(), withInterceptors([scenarioInterceptor])),
    provideApiBaseUrls(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
  ],
};
