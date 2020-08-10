import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';

import {
  SignupRoutingModule
} from './signup-routing.module';
import {
  SignUpComponent
} from './signup.component';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  NgxSpinnerModule
} from 'ngx-spinner';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgxIntlTelInputModule, } from 'ngx-intl-tel-input';
@NgModule({
  declarations: [SignUpComponent],
  imports: [
    CommonModule,
    SignupRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    BsDropdownModule.forRoot(), 
    NgxIntlTelInputModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SignupModule {}