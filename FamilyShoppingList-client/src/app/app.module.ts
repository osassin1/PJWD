import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app.routing.module';
import { NavigationComponent } from './navigation/navigation.component';
// import { InventoryComponent } from './inventory/inventory.component';
// import { InventoryService } from './inventory/inventory.service';
// import { ShoppingcartComponent } from './shoppingcart/shoppingcart.component';
// import { ShoppingcartService } from './shoppingcart/shoppingcart.service';
// import { PlaceOrderComponent } from './placeorder/placeorder.component';



@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent
    // InventoryComponent,
    // ShoppingcartComponent,
    // PlaceOrderComponent,
  ],
  imports: [
    // BrowserModule,
    // NgbModule,
    // NgbPaginationModule,
    // NgbAlertModule,
    // AppRoutingModule,
    // ReactiveFormsModule
  ],
  //providers: [InventoryService, ShoppingcartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
