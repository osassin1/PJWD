import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { AuthenticationService } from '../authentication/authentication.service';

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

export class AuthenticationComponent implements OnInit, OnDestroy {

  formLoginSignup!: FormGroup;  // one form group for login & sign up

  //--- signup ---
  signup = false;           // set to true onSignup
  submittedSignup = false;  // set to ture onSubmitSignup
  family_id: number = 0;    // get family_id back or generate a new one
  colorsToSelectFrom: any[] = [];   // get all avaiable colors that are
                                    // still available (#family members = #colors)
  newFamilyCode: string = "";   // for a new family, create a new code that
                                // all family members must use to join the family
  buttonSignup: string = "";    // during sign up the button changes from 'next'
                                // to 'submit'; the colors cannot be retrieved 
                                // without the family_id
  selectColorError = true;      // if something goes wrong with colors

  //--- login ---
  submittedLogin = false;   // set to true onLogin
  error = '';               // error message when loading family member

  loading = false;          // let's the login or signup button spin
  private timeOut: any;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formLoginSignup = this.formBuilder.group({
      username: ['', {
        validators: [Validators.required, Validators.minLength(6), Validators.maxLength(20)],
        asyncValidators: [usernameExistsValidator(this.authenticationService)], updateOn: 'blur'
      }],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      colorSelect: null,
      familyCode: ['', {
        validators: [Validators.required],
        asyncValidators: [codeExistsValidator(this.authenticationService)], updateOn: 'blur'
      }]
    });
    this.buttonSignup = "Next";
  }

  private loadColors(family_id: number) {
    this.authenticationService.getAllColors(family_id).subscribe((response: any) => {
      this.colorsToSelectFrom = response;
      this.formLoginSignup.controls['colorSelect'].enable();
    });
  }

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

          console.log('loginFamilyMember', v)

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
  clearTimeout(this.timeOut);
}

  onLogin() {
    this.submittedLogin = true;
    this.loginFamilyMember(this.fgc['username'].value, this.fgc['password'].value);
    this.timeOut = setTimeout(() => {
      this.loading = false;
    }, 2000);

  }

  onNewFamilyCode() {
    this.authenticationService.getNewFamilyCode().subscribe((response: any) => {
      this.newFamilyCode = response['family_code'];
      this.formLoginSignup.controls['familyCode'].setValue(response['family_code']);
    });

  }

  onSignup() {
    this.fgc['colorSelect'].disable();
    this.fgc['username'].setValue("");
    this.fgc['password'].setValue("");
    this.signup = true;
  }

  onSubmitSignup() {
    if (this.buttonSignup == "Next") {
      this.submittedSignup = true;
      if (this.formLoginSignup.invalid) {
        return;
      }
      this.authenticationService.getFamilyID(this.fgc['familyCode'].value)
        .subscribe((response: any) => {
          console.log('response:', response);
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
        this.authenticationService.createNewFamilyMember(
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
            }, 2000);
          });
      }
    }
  }

  onSignupCancel() {
    this.signup = false;
    this.buttonSignup = "Next";
  }

  onColorSelection($event: any) {
    if ($event && $event['color_id'] > 0) {
      this.selectColorError = false;
    }
  }

  // --- getters ---
  get fgc() { return this.formLoginSignup.controls; }   // used to access controls and values
  get fg() { return this.formLoginSignup; }             // used to check if form is valid
  get isAuthenticated() {                               // return true if family member is logged in
    return this.authenticationService.isAuthenticated;
  }

  getFamilyID() {
    if (this.authenticationService.familyMemberValue) {
      return this.authenticationService.familyMemberValue?.family_id;
    }
    return false;
  }

  getSignup() {
    return this.signup;
  }

}


export function usernameExistsValidator(auth: AuthenticationService): AsyncValidatorFn {
  return (control: AbstractControl) => {
    return auth.findUsername(control.value)
      .pipe(map(fc => fc ? { usernameExists: true } : null)
      );
  }
};


export function codeExistsValidator(auth: AuthenticationService): AsyncValidatorFn {
  return (control: AbstractControl) => {

    return auth.findFamilyCode(control.value)
      .pipe(map(fc => fc ? { codeInValid: true } : null)
      );
  }
};
