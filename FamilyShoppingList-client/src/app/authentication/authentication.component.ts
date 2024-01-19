import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../authentication/authentication.service';
import { HttpClientModule } from '@angular/common/http';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

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
    //private route: ActivatedRoute,
    //private router: Router,
    //private authenticationService: AuthenticationService
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

    this.authenticationService.setAuthenticated(false);

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

  // onSubmit(){
  //   this.isAuthenticated = 1;
  // }


  get f() { return this.loginForm.controls; }
  get fs() { return this.signupForm.controls; }

  get authenticated() {

    return this.authenticationService.getAuthenticated();
    //return 0;
  }


onLogin() {
  this.submittedLogin = true;

  // stop here if form is invalid
  if (this.loginForm.invalid) {
      return;
  }

  this.error = '';
  this.loading = true;

  const respdata = this.authenticationService.login(this.f['username'].value, this.f['password'].value);

  console.log('respdata: ' + JSON.stringify(respdata) );

  // this.authenticationService.login(this.f.username.value, this.f.password.value)
  //     .pipe(first())
  //     .subscribe({
  //         next: () => {
  //             // get return url from route parameters or default to '/'
  //             const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  //             this.router.navigate([returnUrl]);
  //         },
  //         error: error => {
  //             this.error = error;
  //             this.loading = false;
  //         }
  //     });

  setTimeout(() => 
  {
    this.loading = false;
    this.authenticationService.setAuthenticated(true); 
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


