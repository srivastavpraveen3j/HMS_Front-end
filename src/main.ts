// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations(),    // Required for toastr to work
    provideToastr(),        // ✅ Toast support
  ]
}).catch((err) => console.error(err));
