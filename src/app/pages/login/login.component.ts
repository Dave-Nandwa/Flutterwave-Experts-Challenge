import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import feather from 'feather-icons';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  loginForm: FormGroup;
  submitted = false;
  returnUrl: string;
  error = '';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private utils: UtilitiesService,
    private spinner: NgxSpinnerService
    ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // reset login status
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
  get f() { return this.loginForm.controls; }


  login() {
    this.spinner.show();
    this.utils.infoToast(`Please Wait...`);
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.loginUser(this.loginForm.value).then(() => {
      this.spinner.hide();
      console.log('Authentication Successful.', 'toast-success');
      this.utils.successToast(`Authentication Successful.`);
      let user = firebase.auth().currentUser
      this.router.navigateByUrl('');
      this.loading = false;
      // this.setuserInfo(data[0]);
    }).catch((error) => {
      this.spinner.hide();
      // Handle Errors here.
      /* -------------------------------- Log Error ------------------------------- */
      this.error = error;
      this.loading = false;
      console.log(error);
      console.log("Log In Error.", "toast-error");
      Swal.fire(
        'Error',
        error.message,
        'error'
      )
      // Display Error Message to User
    });
  }
}
