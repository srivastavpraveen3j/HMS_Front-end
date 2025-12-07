// File: app/app.config.ts

import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './views/mastermodule/usermaster/interceptor/auth.interceptor';

// ✅ NEW: Import animations and toastr provider
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { apiKeyInterceptor } from './views/mastermodule/usermaster/interceptor/apikeyinterceptor/api-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(ReactiveFormsModule, HttpClientModule),

    provideHttpClient(withInterceptors([authInterceptor, apiKeyInterceptor])),

    // ✅ Add these for toastr support
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-middle-right',
      closeButton: true,
      timeOut: 10000,
      progressBar: true,
      enableHtml: true,
    }),
  ],
};
