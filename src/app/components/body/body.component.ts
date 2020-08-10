import { Component, OnInit, Inject } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { CartService } from '../../services/cart.service';
import { APP_CONFIG, IAppConfig } from '../../app_config/app.config';
import { DataService } from '../../services/data.service';
import { ProductsService } from '../../services/products.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
  animations: [

    trigger('listAnimation', [

      transition('* <=> *', [
        query(':enter',
          [style({ opacity: 0 }), stagger('60ms', animate('600ms ease-out', style({ opacity: 1 })))],
          { optional: true }
        ),
        query(':leave',
          animate('200ms', style({ opacity: 0 })),
          { optional: true }
        )
      ])
    ])
]
})
export class BodyComponent implements OnInit {

  public products:any = [];
  public itemSelector:any = [];
  localTax:number = 10;
  dutyTax:number = 5;
  searchText: string = 'All';
  currency_code:any;


  constructor(
    @Inject(APP_CONFIG) appConfig: IAppConfig,  
    private _dataService: DataService,
    private _productsService: ProductsService,
    private _cartService: CartService) { 
      this.currency_code = appConfig.currency_code;
    }
    

  ngOnInit() {

    this._dataService.getData();
    this._dataService.product.subscribe(res => this.products = res);
    this.getCategories();
    
  }

  //Filter Categories
  getCategories(){
    this._productsService.getProductAPI().subscribe(res => this.itemSelector = res.categories);
    //console.log("categories", this.itemSelector)
  }

  addItemInCart(product, quantity){
    this._cartService.addToCart(product, quantity);
  }

  filterList(value){
    this.searchText = value;
  }

  //Single quantity of product in cart
  getSingleQty(id): number {
    return this._cartService.getSingleQty(id);
  }

}
