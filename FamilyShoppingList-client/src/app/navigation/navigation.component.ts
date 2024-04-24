import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterLink, RouterLinkActive } from '@angular/router';

import { AuthenticationService } from '../authentication/authentication.service';



@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {



  // Click on the name and get the family code
  // and toggle back to the name.
  toggleNameFamilyCodeBoolean = false;

  constructor(private authenticationService:AuthenticationService){}

  get isAuthenticated(){
    return this.authenticationService.isAuthenticated;
  }

  logout() {
    this.authenticationService.logout();
  }

  firstName() {
    if( this.authenticationService.familyMemberValue ) {
      return this.authenticationService.familyMemberValue.first_name;
    }
    return "";
  }
  lastName() {
    if( this.authenticationService.familyMemberValue ) {
      return this.authenticationService.familyMemberValue.last_name;
    }
    return "";
  }
  // When clicking on the name (first and last), toggle to the
  // family code
  get familyCode() {
    if( this.authenticationService.familyMemberValue ) {
      return this.authenticationService.familyMemberValue.family_code;
    }
    return "";
  }
  toggleNameFamilyCode(){
    this.toggleNameFamilyCodeBoolean = !this.toggleNameFamilyCodeBoolean;
  }

  color() {
    if( this.authenticationService.familyMemberValue ) {
      return this.authenticationService.familyMemberValue.color.name;
    }
    return "";
  }
}

//--- end of file ---
