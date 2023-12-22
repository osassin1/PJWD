import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from '../authentication/authentication.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, AuthenticationComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {


  isAuthenticated(){
    return 1; //AuthenticationComponent.authenticated();
  }

  noOfItemsOnList(){
    return 0;
  }
}
