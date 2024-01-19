import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from '../authentication/authentication.component';
import { FamilyMemberService } from '../family_member/family_member.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, AuthenticationComponent],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {

  constructor(private familyMemberService:FamilyMemberService){}

  isAuthenticated(){
    // console.log("NavigationComponent::isAuthenticated() = " + 
    //     this.familyMemberService.isAuthenticated);
    return this.familyMemberService.isAuthenticated;
  }

  noOfItemsOnList(){
    return 0;
  }
}
