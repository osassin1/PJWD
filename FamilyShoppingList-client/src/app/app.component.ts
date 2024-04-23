import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';

import { AuthenticationService } from '../app/authentication/authentication.service'


const packageJson = require( '../../package.json' );

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    NavigationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  constructor(private authenticationService:AuthenticationService ){}
  title = 'FamilyShoppingList';
  appVersion: string = packageJson.version;
  get isAuthenticated(){
    return this.authenticationService.isAuthenticated;
  }
}
