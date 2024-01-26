import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { Router, ActivatedRoute } from '@angular/router';
//import { first } from 'rxjs/operators';

import { AuthenticationService } from '../authentication/authentication.service';
import { FamilyMemberService } from '../family_member/family_member.service';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, NgSelectModule, NgStyle, NgOptionHighlightModule
  ],
  providers: [AuthenticationService],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
  
})


export class AuthenticationComponent implements OnInit {
  loginForm!: FormGroup;
  signupForm! : FormGroup;
  loading = false;
  submittedLogin = false;
  submittedSignup = false;
  signup = false;
  error = '';

  colorsToSelectFrom: any[] = [];

  //isAuthenticated = 0;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService:AuthenticationService,
    private familyMemberServcice: FamilyMemberService,
    private route: ActivatedRoute,
    private router: Router,
    ) {
    //iconRegistry.addSvgIcon('thumps-up');
    // redirect to home if already logged in
    //if (this.authenticationService.userValue) {
    //    this.router.navigate(['/']);
    //}
    }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)] ],
      password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)] ],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      color_fm: ['', Validators.required]
    });

    // just login for testing purposes 
    //this.loginFamilyMember("osassin","mysecret");

    // this is for testing when signup is true from the start
    // the 'signup' button will not be pressed, so load colors now
    if (this.signup) {
      this.loadColors();
    }
  }

  private loadColors(){
    this.authenticationService.getAllColors().subscribe((response:any) => {
      console.log('response:',response);
      this.colorsToSelectFrom = response;
    });
  }

  private loginFamilyMember(username : string, password : string){
    this.error = '';
    this.loading = true;
  
    this.authenticationService.login(
      username, 
      password
      ).subscribe({
        next: (v) => { 
          console.log('loginFamilyMember : ');
          console.log(v);
          //this.familyMemberServcice.familyMember = v; 
          this.loading = false;

          // --- ToDo ---
          // http://localhost:8081/authentication?returnUrl=%2Fshoppinglist
          //
          // doesn't work
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/shoppinglist';

          console.log('retunrUrl:' + returnUrl);

          this.familyMemberServcice.isAuthenticated = true;
          //return this.familyMemberServcice.familyMember;
          //this.router.navigate(['/shoppinglist']);
          this.router.navigate([returnUrl]);
        },
        error: (e) => {
          this.error = e.error.message;
          this.loading = false;
        },
        complete: () => console.info('authenticat.component: complete')
      });
  
  }


  get f() { return this.loginForm.controls; }
  get fs() { return this.signupForm.controls; }

  get authenticated() {
    return this.familyMemberServcice.isAuthenticated;
  }


onLogin() {
  this.submittedLogin = true;

  // stop here if form is invalid
  if (this.loginForm.invalid) {
      return;
  }

  console.log('this.authenticationService.login');

  this.loginFamilyMember( this.f['username'].value, this.f['password'].value);

  console.log('this.authenticationService.login: ' +  this.familyMemberServcice.isAuthenticated);

  if( this.familyMemberServcice.isAuthenticated ){
    console.log('this.router.navigate');
    this.router.navigate(['/shoppinglist']);
  }

  
  setTimeout(() => 
  {
    this.loading = false;
    //this.authenticationService.setAuthenticated(true); 
  }, 2000);

}

getSignup()
{
  return this.signup;
}

  onSignup() {
    console.log("onSignUp");

    this.loadColors();
    
    console.log('authentication.component: after this.authenticationService.getAllColors().subscribe((response:any) => {');
  

    this.signup = true;
    console.log("onSignUp done");
  }

  onSubmitSignup() {
    console.log('onSubmitSignup');
    this.submittedSignup = true;

    if (this.signupForm.invalid ) {
        return;
    }

  }

}


