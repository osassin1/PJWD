import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { AuthenticationComponent } from '../authentication/authentication.component';
import { AuthenticationService } from '../authentication/authentication.service';

//import { FamilyMemberService } from '../family_member/family_member.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {

  toggleNameFamilyCodeBoolean = false;

  //constructor(private familyMemberService:FamilyMemberService){}
  constructor(private authenticationService:AuthenticationService){}

  isAuthenticated(){
     //console.log("NavigationComponent::isAuthenticated() = " );
      
     //    this.familyMemberService.isAuthenticated);
    //return this.familyMemberService.isAuthenticated;
    return true;
  }
  logout()
  {
    console.log('NavigationComponent: logout');
    this.authenticationService.logout();
  }

  fmv(){
    return this.authenticationService.familyMemberValue;
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
  get familyCode() {
    if( this.authenticationService.familyMemberValue ) {
      return this.authenticationService.familyMemberValue.family_code;
    }
    return "";
  }

  color() {
    if( this.authenticationService.familyMemberValue ) {
      return this.authenticationService.familyMemberValue.color.name;
    }
    return "";
  }

  noOfItemsOnList(){
    return 0;
  }

  toggleNameFamilyCode(){
    this.toggleNameFamilyCodeBoolean = !this.toggleNameFamilyCodeBoolean;
  }
}
