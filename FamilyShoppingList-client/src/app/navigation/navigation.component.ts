import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from '../authentication/authentication.component';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, AuthenticationComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {

  constructor(private authenticationService:AuthenticationService){}

  isAuthenticated(){
    console.log("NavigationComponent::isAuthenticated() = " + 
        this.authenticationService.getAuthenticated());
    return this.authenticationService.getAuthenticated();
  }

  noOfItemsOnList(){
    return 0;
  }
}
