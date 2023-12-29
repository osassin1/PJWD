import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'
import {provideHttpClient} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthenticationService } from './authentication/authentication.service';

// the providers are important to make this work for the services and also the animations
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    AuthenticationService
  ]
};
