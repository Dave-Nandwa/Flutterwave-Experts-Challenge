import {
  BrowserModule
} from '@angular/platform-browser';
import {
  NgModule
} from '@angular/core';
import {
  HttpClientModule
} from '@angular/common/http';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import {
  AppRoutingModule
} from './app-routing.module';

import {
  AppComponent
} from './app.component';
import {
  BodyComponent
} from './components/body/body.component';
import {
  PaymentComponent
} from './components/checkout/payment/payment.component';
import {
  FooterComponent
} from './components/footer/footer.component';

import {
  ProductsService
} from './services/products.service';
import {
  NgbModule
} from '@ng-bootstrap/ng-bootstrap';
import {
  CartService
} from './services/cart.service';
import {
  DataService
} from './services/data.service';
import {
  CartComponent
} from './components/cart/cart.component';

// Config
import {
  APP_CONFIG,
  AppConfig
} from './app_config/app.config';
import {
  NgxPayPalModule
} from 'ngx-paypal';
import {
  CheckordersComponent
} from './components/checkout/checkorders/checkorders.component';
import {
  NavComponent
} from './components/nav/nav.component';
import {
  FilterPipe
} from './services/filter.service';
import {
  TaxService
} from './services/tax.service';
import {
  ProductDetailsComponent
} from './components/product-details/product-details.component';
import {
  AuthService
} from './services/auth.service';
import {
  UtilitiesService
} from './services/utilities.service';

/* -------------------------------------------------------------------------- */
/*                                 AngularFire                                */
/* -------------------------------------------------------------------------- */
import {
  AngularFireModule
} from '@angular/fire';
import {
  AngularFirestoreModule
} from '@angular/fire/firestore';
import {
  credentials
} from '../credentials';
import {
  AngularFireAuthGuardModule
} from '@angular/fire/auth-guard';
import {
  AngularFireAuthModule
} from '@angular/fire/auth';
import {
  AngularFireStorageModule
} from '@angular/fire/storage';
import { FlutterwaveComponent } from './components/checkout/flutterwave/flutterwave.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    AppComponent,
    BodyComponent,
    FooterComponent,
    CartComponent,
    PaymentComponent,
    CheckordersComponent,
    NavComponent,
    FilterPipe,
    ProductDetailsComponent,
    FlutterwaveComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxPayPalModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    /* ------------------------------ Angular fire ------------------------------ */
    AngularFireModule.initializeApp(credentials.firebaseConfig),
    AngularFireAuthGuardModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    NgxSpinnerModule
  ],
  providers: [
    ProductsService,
    CartService,
    DataService,
    TaxService,
    AuthService,
    UtilitiesService,
    {
      provide: APP_CONFIG,
      useValue: AppConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}