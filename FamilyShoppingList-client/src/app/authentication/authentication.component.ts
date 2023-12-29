import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '../authentication/authentication.service';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
  
})


export class AuthenticationComponent implements OnInit {
  loginForm!: FormGroup;
  signupForm! : FormGroup;
  loading = false;
  submitted = false;
  signup = false;
  error = '';
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
  this.authenticationService.setAuthenticated(false);
}

  // onSubmit(){
  //   this.isAuthenticated = 1;
  // }

      // convenience getter for easy access to form fields
      get f() { return this.loginForm.controls; }


      get authenticated() { 
        
        return this.authenticationService.getAuthenticated();
        //return 0;
      }


onLogin() {
  this.submitted = true;

  // stop here if form is invalid
  if (this.loginForm.invalid) {
      return;
  }

  this.error = '';
  this.loading = true;
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
onSignup()
{
  this.signupForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
});  
  this.signup = true;
}

onSubmitSignup(){

}

}


