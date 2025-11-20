import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';
import { LOCALE_ID } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: LOCALE_ID, useValue: 'es' },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    ],
};
