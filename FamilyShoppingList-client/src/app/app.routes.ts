import { Routes } from '@angular/router';
import { ShoppinglistComponent } from './shoppinglist/shoppinglist.component';
import { InventoryComponent } from './inventory/inventory.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthGuard } from './authentication/authentication.service';

export const routes: Routes = [
    { path: '', redirectTo: '/shoppinglist', pathMatch: 'full'},  
    { path: 'shoppinglist', component: ShoppinglistComponent, canActivate: [AuthGuard]}, 
    { path: 'authentication', component: AuthenticationComponent },
    { path: 'inventory', component: InventoryComponent,  canActivate: [AuthGuard] },
    { path: '**', redirectTo:'/authentication'}
];
