import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { InventoryComponent } from './inventory/inventory.component';
//import { AuthenticationService } from './authentication/authentication.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AuthenticationComponent,
    InventoryComponent,
    NavigationComponent
    //AuthenticationService, NavigationComponent

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FamilyShoppingList';
  
}
