import { Component, OnInit,Inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { IProduct } from '../../models/product';
import { Observable, Subscription } from 'rxjs';
import { APP_CONFIG, IAppConfig } from '../../app_config/app.config';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cartLength: number;
  currency_code:any;
  cartItems:IProduct[];
  quantityCart:any;
  private subscription: Subscription;

  constructor(@Inject(APP_CONFIG) appConfig: IAppConfig, private _cartService: CartService) { 
    this.currency_code = appConfig.currency_code;
  }

  ngOnInit() {
    this.subscription = this._cartService.itemsInCartObs.subscribe(res => this.cartItems = res);
  }

  public getItemsCart():any{
    this.cartLength = this._cartService.getCartItems().length;
    return this._cartService.getCartItems();
  }

  //Total quantity of product in cart
  public getTotalQty(): Observable<number> {
    return this._cartService.getTotalQty();
  }

  //Total taxes local and imported
  public getTotalTaxes(): Observable<number> {
    return this._cartService.getTotalTaxes();
  }

  //Total amount
  public getTotal(): Observable<number> {
    return this._cartService.getTotalAmount();
  }

  removeItemFromCart(id:number): void {
    this._cartService.removeItem(id);
    this._cartService.checkoutTotalProd();
  }

  ngOnDestroy() {
      this.subscription.unsubscribe();
  }

}
