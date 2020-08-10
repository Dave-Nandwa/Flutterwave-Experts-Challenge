
import { Injectable, Inject } from '@angular/core';
import { IProduct } from '../models/product';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../app_config/app.config';
import { ICart } from '../models/cart';


@Injectable()
export class CartService{

    public itemsInCartSubject: BehaviorSubject<IProduct[]> = new BehaviorSubject([]);
    itemsInCartObs = this.itemsInCartSubject.asObservable();

    private itemsInCart: IProduct[] = [];
    currency_code:any;

    cartLengthSubject = new BehaviorSubject<any>([]);
    itemsInCartLength = this.cartLengthSubject.asObservable();

    //Create data for pay pall
    public itemsForPayPall: BehaviorSubject<ICart[]> = new BehaviorSubject([]);
    itemsPayObs = this.itemsForPayPall.asObservable();

    payItems:ICart[] = [];

    constructor(@Inject(APP_CONFIG) appConfig: IAppConfig){
        this.currency_code = appConfig.currency_code;
    }

    getCartItems(): any {
        return this.itemsInCart;
    }

    addToCart(product, quantity):void{
        
                var found = false;

                for (var i = 0; i < this.itemsInCart.length && !found; i++) {
                    if (this.itemsInCart[i].id == product.id) {
                        found = true;
                        this.itemsInCart[i].quantity = this.itemsInCart[i].quantity + quantity;

                        this.itemsInCartSubject.next(this.itemsInCart);
                        this.cartLengthSubject.next(this.itemsInCart.length);
                    }
                }
                if(!found){
                    this.itemsInCart.push({
                        id:product.id,
                        name: product.name,
                        category: product.category,
                        price: (product.price),
                        image: product.image,
                        quantity: quantity,
                        currency: this.currency_code,
                        tax: product.tax
                    });
                    this.itemsInCartSubject.next(this.itemsInCart);
                    this.cartLengthSubject.next(this.itemsInCart.length);
                }
            }

    //Remove all product from cart
    removeAllItems():any{
        this.itemsInCart = [];
        this.itemsInCart.length = 0;
        this.cartLengthSubject.next(this.itemsInCart.length);
        this.itemsInCartSubject.next(this.itemsInCart);
    }

    //Remove group of product from cart
    removeItem(id:number):void{
        let item = this.itemsInCart.find(ob => ob.id === id);
        let itemIndex = this.itemsInCart.indexOf(item);
        this.itemsInCart.splice(itemIndex, 1);
        this.itemsInCartSubject.next(this.itemsInCart);
        this.cartLengthSubject.next(this.itemsInCart.length);
    }

    //Remove single product to the cart
    removeSingleToCart(product, quantity):void{
        for (var i = 0; i < this.itemsInCart.length; i++) {
            
            if (this.itemsInCart[i].id == product.id) {
                this.itemsInCart[i].quantity = this.itemsInCart[i].quantity - quantity;
                this.itemsInCartSubject.next(this.itemsInCart);
                this.cartLengthSubject.next(this.itemsInCart.length);
            }
            
        }
    }

    //Remove single product to the cart
    getSingleQty(id):number{
        let qtyProd = 0;

        for (var i = 0; i < this.itemsInCart.length; i++) {
            
            if (this.itemsInCart[i].id == id) {
                qtyProd = this.itemsInCart[i].quantity;
            }
            
        }

        return qtyProd;
    }

    //Create array for pay pall
    public checkoutTotalProd(){
        this.payItems = [];
        this.itemsInCart.forEach( (item) => {
            this.payItems.push({
              name: item.name,
              unit_amount:{
                currency_code:this.currency_code,
                value:item.price.toFixed(2)
              },
              quantity: item.quantity
          });
        });
        this.itemsForPayPall.next(this.payItems);
      }
    
    //Total quantity of product in cart
    public getTotalQty(): Observable<number> {
        return this.itemsInCartSubject.pipe(map((items: IProduct[]) => {
          return items.reduce((prev, curr: IProduct) => {
              return prev + (curr.quantity);
          }, 0);
        }));
      }

    public getTotalTaxes(): Observable<number> {
        return this.itemsInCartSubject.pipe(map((items: IProduct[]) => {
            return items.reduce((prev, curr: IProduct) => {
                return prev + (curr.tax * curr.quantity);
            }, 0);
        }));
    }

    //Total amount in cart product
    public getTotalAmount(): Observable<number> {
        return this.itemsInCartSubject.pipe(map((items: IProduct[]) => {
            return items.reduce((prev, curr: IProduct) => {
                return prev + (curr.price * curr.quantity);
            }, 0);
        }));
    }
}
