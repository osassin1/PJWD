import { Component, Directive, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { Router, ActivatedRoute } from '@angular/router';
//import { first } from 'rxjs/operators';
import { Observable, BehaviorSubject, map } from 'rxjs';

import { AuthenticationService } from '../authentication/authentication.service';
import { FamilyMemberService } from '../family_member/family_member.service';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, NgSelectModule, NgStyle, NgOptionHighlightModule
  ],
  providers: [],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
  
})



export class AuthenticationComponent implements OnInit {
  //loginForm!: FormGroup;
  //signupForm! : FormGroup;

  formLoginSignup!: FormGroup;

  loading = false;
  submitReady = false;
  submittedLogin = false;
  submittedSignup = false;
  signup = false;
  error = '';

  family_id: number = 0;
  newFamilyCode: string = "";

  colorsToSelectFrom: any[] = [];

  //isAuthenticated = 0;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
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
    // this.loginForm = this.formBuilder.group({
    //   username: ['', Validators.required],
    //   password: ['', Validators.required]
    // });

    // this.signupForm = this.formBuilder.group({
    //   username: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)] ],
    //   password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)] ],
    //   firstName: ['', Validators.required],
    //   lastName: ['', Validators.required],
    //   color_fm: ['', Validators.required],
    //   select_color: null
    // });


    this.formLoginSignup = this.formBuilder.group({
      username: ['', {
        validators: [Validators.required,Validators.minLength(6), Validators.maxLength(20)],
        asyncValidators: [usernameExistsValidator(this.authenticationService)], updateOn: 'blur'
      }],
      password: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(20)] ],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      color_select: null,
      familyCode: ['', {
        validators: [Validators.required],
        asyncValidators: [codeExistsValidator(this.authenticationService)], updateOn: 'blur'
      }]
    });

    //this.signupForm.controls['select_color'].disable();

    // just login for testing purposes 
    //this.loginFamilyMember("osassin","mysecret");

    // this is for testing when signup is true from the start
    // the 'signup' button will not be pressed, so load colors now
    // if (this.signup) {
    //   this.loadColors();
    // }
  }


  
  // (control: AbstractControl) : ValidationErrors | null {
  //   const value = control.value as string;
  //   if( value == "***" ) {
  //     return null;
  //   } else {
  //     return { valid: false };
  //   }
  // }


  familyCode(){
    if(this.formLoginSignup.controls['familyCode'] ){
      //return this.formLoginSignup.controls['familyCode'].errors['codeValid'] || "empty"
    }
    return "<empty>";
  }

  onNewFamilyCode(){
    this.authenticationService.getNewFamilyCode().subscribe((response:any) => {
      console.log('getNewFamilyCode response:',response);
      this.newFamilyCode = response['family_code'];
      this.formLoginSignup.controls['familyCode'].setValue(response['family_code']);
    });

  }

  private loadColors(family_id: number){
    this.authenticationService.getAllColors(family_id).subscribe((response:any) => {
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
      )
      .subscribe({
        next: (v) => { 
          console.log('loginFamilyMember : ', v);
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
          //before ==> this.router.navigate(['returnUrl]);
          this.router.navigateByUrl(returnUrl);
        },
        error: (e) => {
          this.error = e.error.message;
          this.loading = false;
        },
        complete: () => console.info('authenticat.component: complete')
      });
  
  }


  get f() { return this.formLoginSignup.controls; }
  get fs() { return this.formLoginSignup.controls; }

  // get the formGroup.controls
  get fgc() { return this.formLoginSignup.controls; }

  get fg() { return this.formLoginSignup; }

  get authenticated() {
    return this.familyMemberServcice.isAuthenticated;
  }

  getFamilyID(){
    if(this.authenticationService.familyMemberValue) {
      return this.authenticationService.familyMemberValue?.family_id;
    }
    return false;
  }

  // getFamilyIDByCode(family_code: string){
  //   this.authenticationService.getFamilyID(family_code).subscribe((response:any) => {
  //     console.log('response:',response);
  //     this.family_id = response['family_id'];
  //   });
  // }

onLogin() {
  this.submittedLogin = true;

  console.log("this.f['username'].valid", this.f['username'].valid)

  // if ( !(this.f['username'].valid && this.f['password'].valid) ) {
  //     return;
  // }

  this.loginFamilyMember( this.f['username'].value, this.f['password'].value);

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
    this.formLoginSignup.controls['color_select'].disable();


    // if( this.getFamilyID( )) {
    //   this.loadColors();
    // } else {

    // }
    
    console.log('authentication.component: after this.authenticationService.getAllColors().subscribe((response:any) => {');
  

    this.signup = true;
    console.log("onSignUp done");
  }

  onSubmitSignup() {
    console.log('onSubmitSignup');
    this.submittedSignup = true;

    if (this.formLoginSignup.invalid ) {
        return;
    }

    this.authenticationService.getFamilyID(this.formLoginSignup.controls['familyCode'].value)
    .subscribe((response:any) => {
        console.log('response:',response);
        this.family_id = response['family_id'];
        console.log('family_id', this.family_id);

        this.loadColors(this.family_id);
      });



  }

  onSignupCancel(){
    this.signup = false;
  }

}


export function usernameExistsValidator(auth: AuthenticationService): AsyncValidatorFn {
  return (control: AbstractControl)  => {
     return auth.findUsername(control.value)
      .pipe(map(fc => fc ? {usernameExists: true} : null )
      );
  }};


export function codeExistsValidator(auth: AuthenticationService): AsyncValidatorFn {
  return (control: AbstractControl)  => {

     return auth.findFamilyCode(control.value)
      .pipe(map(fc => fc ? {codeInValid: true} : null )
      );


    // .pipe(
    //     map(auth => auth ? {codeValid: true } : null )
    //   );


    // const value = control.value;

    // if( !value ) {
    //   return null;
    // }

    // const familyCodeValid = false;

    //return !familyCodeValid ? { codeValid: true } : null;
  }};

  // private loadColors(){
  //   this.authenticationService.getAllColors().subscribe((response:any) => {
  //     console.log('response:',response);
  //     this.colorsToSelectFrom = response;
  //   });
  // }