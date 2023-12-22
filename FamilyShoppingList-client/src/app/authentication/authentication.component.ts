import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css'
})
export class AuthenticationComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  isAuthenticated = 0;

  constructor(
    private formBuilder: FormBuilder,
    //private route: ActivatedRoute,
    //private router: Router,
    //private authenticationService: AuthenticationService
) {
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
}

  onSubmit(){
    this.isAuthenticated = 1;
  }

      // convenience getter for easy access to form fields
      get f() { return this.loginForm.controls; }


      get authenticated() { return this.isAuthenticated;}
}
