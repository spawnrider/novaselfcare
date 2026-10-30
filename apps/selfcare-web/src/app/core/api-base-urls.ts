import { Provider, inject } from '@angular/core';
// Tokens générés par Orval (override.angular.baseUrl)
import { BILLING_BASE_URL } from '../api/billing/billing-api.base-url';
import { CMS_BASE_URL } from '../api/cms/cms-api.base-url';
import { CUSTOMER_BASE_URL } from '../api/customer/customer-api.base-url';
import { OPTIONS_BASE_URL } from '../api/options/options-api.base-url';
import { RUNTIME_CONFIG } from './runtime-config';

const strip = (url: string) => url.replace(/\/+$/, '');

/**
 * Routage par API, résolu en DI selon le mode :
 *  - API métier : BUSINESS_API_URL ('' = même origine, interceptée par MSW en mock)
 *  - CMS        : Strapi en CMS_MODE=real, sinon même origine (mock MSW)
 */
export function provideApiBaseUrls(): Provider[] {
  const business = () => strip(inject(RUNTIME_CONFIG).businessApiUrl);
  return [
    { provide: CUSTOMER_BASE_URL, useFactory: business },
    { provide: BILLING_BASE_URL, useFactory: business },
    { provide: OPTIONS_BASE_URL, useFactory: business },
    {
      provide: CMS_BASE_URL,
      useFactory: () => {
        const c = inject(RUNTIME_CONFIG);
        return c.cmsMode === 'real' ? strip(c.cmsUrl) : '';
      },
    },
  ];
}
