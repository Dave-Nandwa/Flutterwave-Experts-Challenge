import {
  DataService
} from './../../../services/data.service';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';
import {
  v4 as uuidv4
} from 'uuid';
import {
  CartService
} from 'src/app/services/cart.service';
import {
  AngularFirestore
} from '@angular/fire/firestore';
import {
  UtilitiesService
} from 'src/app/services/utilities.service';
import Swal from 'sweetalert2';
import {
  NgxSpinner
} from 'ngx-spinner/lib/ngx-spinner.enum';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  AngularFireAuth
} from '@angular/fire/auth';
import {
  Router
} from '@angular/router';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-flutterwave',
  templateUrl: './flutterwave.component.html',
  styleUrls: ['./flutterwave.component.scss']
})
export class FlutterwaveComponent implements OnInit {
  linkId: string;
  data: any = {};
  country;
  currency;
  standardCountries: any = ['GH', 'KE', 'ZA', 'TZ'];
  userRedirected: boolean = false;
  lat;
  lng;
  confirmation: any;
  priceTaxed: string = '0';
  totalTax: number = 0.7;
  price: number = 0;
  quantity: number = 0;
  userData: any = {};
  items: any = [];
  constructor(
    private http: HttpClient,
    private _cartService: CartService,
    private dataServ: DataService,
    private utils: UtilitiesService,
    private spinner: NgxSpinnerService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this._cartService.getTotalAmount().subscribe(res => this.price = res);
    this._cartService.getTotalQty().subscribe(res => this.quantity = res);
    this.items = this._cartService.getCartItems();
    console.log(this.items);
    this.getUserData();
  }

  payV3() {
    this.spinner.show();
    /* ------------------- Generates a Unique 256-HASH For DB ------------------- */
    const id = this.dataServ.generateID();
    this.priceTaxed = (this.price + this.totalTax).toFixed(2);
    // This object will be stored in the DB for updates by webhooks and interval calls
    const dbPayload = {
      "transactionId": id,
      "amount": this.priceTaxed,
      "quantity": this.quantity,
      "currency": this.userData.currency,
      "country": this.userData.locale.countryCode,
      "userId": this.userData.userId,
      "userEmail": this.userData.email,
      "userPhone": this.userData.locale.internationalNumber,
      "items": this.items,
      "status": 'pending',
       "when": moment().format('ddd, hh:mm a')
    }
    /* ------------------ Send Reqest to Get Back Checkout Link ----------------- */
    this.http.get(`https://us-central1-flutterwave-store.cloudfunctions.net/main/fwave-challenge`, {
      observe: 'response',
      params: {
        "txref": id,
        "amount": this.priceTaxed,
        "currency": this.userData.currency,
        "country": this.userData.locale.countryCode,
        "userId": this.userData.userId,
        "userEmail": this.userData.email,
        "userPhone": this.userData.locale.internationalNumber,
        "userName": this.userData.name,
      }
    }).subscribe((res: any) => {
      this.spinner.hide();
      console.log(res);
      //Re-Think Might be better to do this in the Node.JS Backend, once the transaction is validated.
      this.authService.updateUserProfile(this.userData.userId, {
        amountSpent: this.priceTaxed
      }).then(() => {
        this.dataServ.sendTransactionToDB(dbPayload).then(() => {
          Swal.fire(
            'Accepted for Processing!',
            `You will now be redirected to complete your payment ${this.userData.fullName}.`,
            'success'
          ).then(() => {
            window.location.replace(res.body.link)
          });
        }).catch((err) => {
          this.spinner.hide();
          Swal.fire(
            'Error',
            err.message,
            'error'
          )
        });
      }).catch((err) => {
        this.spinner.hide();
        Swal.fire(
          'Error',
          err.message,
          'error'
        )
      });
    }, (err) => {
      this.spinner.hide();
      Swal.fire(
        'Error',
        err.message,
        'error'
      )
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                        Get Authenticated User Object                       */
  /* -------------------------------------------------------------------------- */

  /* ------- A bit of callback hell in this function, but it's bearable ------- */

  async getUserData() {
    this.spinner.show();
    const userSub = this.afAuth.authState.subscribe((user) => {
      if (user) {
        const dataSub = this.afs.doc(`users/${user.uid}`).valueChanges().subscribe((userData) => {
          this.spinner.hide();
          this.userData = userData;
          dataSub.unsubscribe();
        }, (err) => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message,
          }).then(() => {
            this.router.navigateByUrl('/login');
          });
        });
      } else {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Auth Error',
          text: 'Kindly Log In First.',
        }).then(() => {
          this.router.navigateByUrl('/login');
        });
      }
      userSub.unsubscribe();
    }, (err) => {
      this.spinner.hide();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      }).then(() => {
        this.router.navigateByUrl('/login');
      });
    });
  }

}