import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';
import { provideWorkatoRepositories } from './workato/workato.providers';
import { WORKATO_API_URL } from './workato/infrastructure/http/workato-api.tokens';

export const HttpLoaderFactory = (http: HttpClient) => {
  return new TranslateHttpLoader();
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
      fallbackLang: 'en'
    }),
    provideWorkatoRepositories(),
    { provide: WORKATO_API_URL, useValue: 'http://localhost:3000' }
  ]
};
