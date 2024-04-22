import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { AuthenticationService } from '../authentication/authentication.service';
import { FamilyMemberService } from '../family_member/family_member.service';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule
  ],
  providers: [],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})

// The component offers to log into the system (login) or to
// sign up as a new family member (signup). In order to join
// an existing family the family code needs to be provided,
// alternatively, one can sign up as a new family and a new
// code is generated.
// Existing family code's can be accessed by family members
// once they have logged in and click on their name. It will
// toggle between name and family code.

export class AuthenticationComponent implements OnInit, OnDestroy {

  // One form group for login & signup.
  formLoginSignup!: FormGroup;

  //--- signup ---
  // The html has two states: (1) login or (2) signup
  // this variable controlls that either (1) or (2) or
  // active.
  _signup: boolean = false;

  // During signup the button changes from 'next'
  // to 'submit'; the colors cannot be retrieved 
  // without the family_id.
  buttonSignup: string = "";

  // The signup process will be executed when this
  // value is set to true, which means all checks have been 
  // applied.
  submittedSignup: boolean = false;

  // A family is identified by its family_id and to join an
  // existing family, a family code needs to be provided
  // However, for a new family and new code needs to be
  // generated.
  family_id: number = 0;

  // For a new family, create a new code that
  // all family members must use to join the family.
  newFamilyCode: string = "";


  // There are a limited number of colors that
  // must be assigned uniquely to each family member.
  // Once all colors are consumed, no more family
  // members can join.

  // Get all avaiable colors that are
  // still available (#family members = #colors).
  colorsToSelectFrom: any[] = [];

  // If something goes wrong with colors (default), otherwise
  // set it to false.
  selectColorError: boolean = true;

  //--- login ---
  // Provide username and password and
  // submit your login and this will
  // be set to true.
  submittedLogin: boolean = false;

  // error message when logginf in family member
  error: string = "";

  // Let's the login or signup button spin
  // and it' more for show at this point
  // with a 2000 ms timeout.
  loading: boolean = false;
  private timeOut: any;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private familyMemberService: FamilyMemberService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formLoginSignup = this.formBuilder.group({
      username: ['', {
        validators: [Validators.required, Validators.minLength(6), Validators.maxLength(20)],
        asyncValidators: [usernameExistsValidator(this.familyMemberService)], updateOn: 'blur'
      }],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      colorSelect: null,
      familyCode: ['', {
        validators: [Validators.required],
        asyncValidators: [codeExistsValidator(this.familyMemberService)], updateOn: 'blur'
      }]
    });
    this.buttonSignup = "Next";
  }

  // Get all remaining colors to chose from while
  // sining up.
  private loadColors(family_id: number) {
    this.familyMemberService.getAllColors(family_id).subscribe((response: any) => {
      this.colorsToSelectFrom = response;
      this.formLoginSignup.controls['colorSelect'].enable();
    });
  }

  // Execute the login process.
  private loginFamilyMember(username: string, password: string) {
    this.error = '';
    this.loading = true;

    this.authenticationService.login(
      username,
      password
    )
      .subscribe({
        next: (v) => {
          // go to the returnUrl or '/shoppinglist'
          this.loading = false;
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/shoppinglist';
          this.router.navigateByUrl(returnUrl);
        },
        error: (e) => {
          this.error = e.error.message;
          this.loading = false;
        }
      });

  }

  ngOnDestroy(): void {
    this.fg.reset();
    clearTimeout(this.timeOut);
  }

  // The login button was clicked.
  onLogin() {
    this.submittedLogin = true;
    this.loginFamilyMember(this.fgc['username'].value, this.fgc['password'].value);
    this.timeOut = setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  // Generate a new family code for a new family.
  onNewFamilyCode() {
    this.familyMemberService.getNewFamilyCode().subscribe((response: any) => {
      this.newFamilyCode = response['family_code'];
      this.formLoginSignup.controls['familyCode'].setValue(response['family_code']);
    });
  }

  // Signup was clicked instead of login
  onSignup() {
    this.fg.reset();
    this.error = "";
    this.fgc['colorSelect'].disable();
    this.fgc['username'].setValue(null);
    this.fgc['password'].setValue(null);
    this.signup = true;
    this.cd.detectChanges();
  }

  // The signup process needs to use or generate a family code
  // and assign a color (or remaining color)
  onSubmitSignup() {
    if (this.buttonSignup == "Next") {
      this.submittedSignup = true;
      if (this.formLoginSignup.invalid) {
        return;
      }
      this.familyMemberService.getFamilyID(this.fgc['familyCode'].value)
        .subscribe((response: any) => {
          this.family_id = response['family_id'];
          this.loadColors(this.family_id);
          this.buttonSignup = "Submit";
        });
    } else {
      if (this.fgc['colorSelect'].value == null) {
        this.selectColorError = true;
        return;
      } else {
        this.selectColorError = false;
        this.loading = true;
        this.familyMemberService.createNewFamilyMember(
          this.fgc['username'].value,
          this.fgc['password'].value,
          this.fgc['firstName'].value,
          this.fgc['lastName'].value,
          this.fgc['colorSelect'].value,
          this.family_id).subscribe(fm => {

            // let's wait 2 seconds before we continue
            setTimeout(() => {
              this.loading = false;
              this.formLoginSignup.reset();
              this.onSignupCancel();
              this.fg.reset();
              this.buttonSignup = "Next";
              this.submittedSignup = false;
            }, 2000);
          });
      }
    }
  }

  onSignupCancel() {
    this.signup = false;
    this.buttonSignup = "Next";
    this.submittedSignup = false;
    this.fg.reset();
    this.fgc['username'].setValue(null);
    this.fgc['password'].setValue(null);
    this.cd.detectChanges();
  }

  onColorSelection($event: any) {
    if ($event && $event['color_id'] > 0) {
      this.selectColorError = false;
    }
  }

  // --- getters ---

  // Convienance helper method to access controls and values
  get fgc() { 
    return this.formLoginSignup.controls; 
  }   
  get fg() { 
    return this.formLoginSignup; 
  }      
  get signup() {
    return this._signup;
  }
  set signup(b: boolean) {
    this._signup = b;
  }
}

//--- Async Validators ---

// These two async validators uses the server API to check
// if the values are ok. There are two cases:
// (1) the username has to be unique amongst all family members
// (2) the family code has to be valid - that's neceassry
//     to connect a new family member to a family.

export function usernameExistsValidator(auth: FamilyMemberService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return auth.findUsername(control.value)
      .pipe(map(fc => fc ? { usernameExists: true } : null)
      );
  }
};

export function codeExistsValidator(auth: FamilyMemberService): AsyncValidatorFn {
  return (control: AbstractControl) => {

    return auth.findFamilyCode(control.value)
      .pipe(map(fc => fc ? { codeInValid: true } : null)
      );
  }
};

//--- end of file ---