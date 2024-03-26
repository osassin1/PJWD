import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'
import {provideHttpClient} from '@angular/common/http';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { routes } from './app.routes';
import { AuthenticationService } from './authentication/authentication.service';
import { ShoppingListService } from './shoppinglist/shoppinglist.service';
import { InventoryService } from './inventory/inventory.service';


// the providers are important to make this work for the services and also the animations
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    // https://stackoverflow.com/questions/71094093/angular-routing-not-working-after-running-ng-build-at-deployment
    AuthenticationService,
    ShoppingListService,
    InventoryService
  ]
};
