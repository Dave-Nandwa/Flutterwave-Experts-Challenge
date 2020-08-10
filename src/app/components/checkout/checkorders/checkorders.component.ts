import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  EventEmitter,
  Output
} from '@angular/core';
import {
  PaymentComponent
} from '../../checkout/payment/payment.component'
import {
  CartService
} from '../../../services/cart.service';
import {
  DataService
} from '../../../services/data.service';
import {
  IProduct
} from '../../../models/product';
import {
  ICart
} from '../../../models/cart';
import {
  Observable,
  Subscription
} from 'rxjs';
import {
  APP_CONFIG,
  IAppConfig
} from '../../../app_config/app.config';

@Component({
  selector: 'app-checkorders',
  templateUrl: './checkorders.component.html',
  styleUrls: ['./checkorders.component.scss']
})
export class CheckordersComponent implements OnInit {

  cartItems: IProduct[];
  payItems: ICart[] = [];
  disableCheckout: boolean = true;
  cartLength: any;
  errorMessage: string;
  price: string = '10.50';
  currency_code: any;
  totalAmount: any;
  dataShare: any[] = [];
  data = [];
  thanksText: boolean = false;
  namePayer: string = '';
  surnamePayer: string = '';

  /* -------------------------------------------------------------------------- */
  /*               Making Paypal Optional, Opting For Flutterwave               */
  /* -------------------------------------------------------------------------- */

  paypalSupported: boolean = false;
  @ViewChild(PaymentComponent, {
    static: true
  }) _paymentComponent: PaymentComponent;
  private subscription: Subscription;

  constructor(
    private _ref: ChangeDetectorRef,
    @Inject(APP_CONFIG) appConfig: IAppConfig,
    private _dataService: DataService,
    private _cartService: CartService) {

    this.currency_code = appConfig.currency_code;
  }

  ngOnInit() {

    this.subscription = this._cartService.itemsInCartObs.subscribe(res => {
      this.cartItems = res;
      this.cartLength = res.length;
    });

    this.subscription = this._cartService.itemsPayObs.subscribe(res => this.payItems = res);

    this.subscription = this._dataService.response.subscribe(res => {
      this.dataShare = res;
      this.completePayment(this.dataShare);
    });

    this._cartService.checkoutTotalProd();

  }

  //Complete Payment send info from PayPal
  completePayment(data) {
    if (data.status == 'COMPLETED') {

      this.namePayer = data.payer.name.given_name;
      this.surnamePayer = data.payer.name.surname;

      this._cartService.removeAllItems();

      this.thanksText = true;
      this._dataService.changeData(this.data);

      if (!this._ref['destroyed']) {
        this._ref.detectChanges();
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this._ref.detach();
  }

  //Total quantity of product in cart
  public getTotalQty(): Observable < number > {
    return this._cartService.getTotalQty();
  }

  //Total amount
  public getTotal(): Observable < number > {
    return this._cartService.getTotalAmount();
  }

  //Add single product in to the cart
  addSingleItemInCart(product, quantity) {
    this._cartService.addToCart(product, quantity);
    this._cartService.checkoutTotalProd();
  }

  removeItemFromCart(id: number): void {
    this._cartService.removeItem(id);
    this._cartService.checkoutTotalProd();
  }

  removeSingleItemToCart(product, quantity) {
    this._cartService.removeSingleToCart(product, quantity);
    this._cartService.checkoutTotalProd();
  }

  //STRIPE RESPONSE
  onValueResponse(response) {
    this._cartService.removeAllItems();
    this.thanksText = true;
    //Only for test
    //console.log("Response", response)
  }

}