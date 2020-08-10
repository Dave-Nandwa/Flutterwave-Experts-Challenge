import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { NgxSpinnerService } from 'ngx-spinner';
import feather from 'feather-icons';
import Swal from 'sweetalert2';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignUpComponent implements OnInit, AfterViewInit {

  signupForm: FormGroup;
  submitted = false;
  returnUrl: string;
  error = '';
  loading = false;

  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	TooltipLabel = TooltipLabel;
	CountryISO = CountryISO;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private utils: UtilitiesService,
    private spinner: NgxSpinnerService
    ) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', Validators.required],
    });

    // reset signup status
    // this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    // tslint:disable-next-line: no-string-literal
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngAfterViewInit() {
    document.body.classList.add('authentication-bg');
    document.body.classList.add('authentication-bg-pattern');
    feather.replace();
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }


  signup() {
    this.spinner.show();
    this.submitted = true;

    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.signupUser(this.signupForm.value).then(() => {
      console.log('Authentication Successful.', 'toast-success');
      this.router.navigateByUrl('login');
      this.loading = false;
      this.spinner.hide();
      // this.setuserInfo(data[0]);
    }).catch((error) => {
      this.spinner.hide();
      // Handle Errors here.
      /* -------------------------------- Log Error ------------------------------- */
      this.error = error;
      this.loading = false;
      console.log(error);
      Swal.fire(
        'Error',
        error.message,
        'error'
      )
      console.log("Log In Error.", "toast-error");
      // Display Error Message to User
    });
  }
}
