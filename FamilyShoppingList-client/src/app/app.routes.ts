import { Routes } from '@angular/router';
import { ShoppinglistComponent } from './shoppinglist/shoppinglist.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthGuard } from './authentication/authentication.service';

export const routes: Routes = [

    { path: '', redirectTo: '/authentication', pathMatch: 'full'},  //canActivate: [AuthGuard]
    { path: 'shoppinglist', component: ShoppinglistComponent, canActivate: [AuthGuard]},  //canActivate: [AuthGuard]
//    { path: 'shoppinglist', component: ShoppinglistComponent },
    { path: 'authentication', component: AuthenticationComponent },
    { path: '**', redirectTo:''}
];
