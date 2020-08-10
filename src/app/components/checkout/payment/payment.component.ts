import { Component, OnInit, Input,Inject } from '@angular/core';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { CartService } from '../../../services/cart.service';
import { DataService } from '../../../services/data.service';
import { APP_CONFIG, IAppConfig } from '../../../app_config/app.config';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})

export class PaymentComponent implements OnInit {

  public payPalConfig: IPayPalConfig;
  showSuccess: boolean = false;
  totalTax:number = 0.7;
  priceTaxed:string = '0';
  price: number = 0;
  @Input() items: [];
  newPrice:number;
  currency_code:any;

  constructor(@Inject(APP_CONFIG) appConfig: IAppConfig, private _dataService:DataService, private _cartService:CartService) { 
    this.currency_code = appConfig.currency_code;
  }

  ngOnInit() {
    this._cartService.getTotalAmount().subscribe(res => this.price = res);  
    this.initConfig();
  }

  private initConfig():void{

    this.payPalConfig = {
      currency:this.currency_code,
      clientId: 'sb',

      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount:{
              currency_code:this.currency_code,
              value:this.priceTaxed,
              breakdown:{
                item_total:{
                  currency_code:this.currency_code,
                  value:this.price.toFixed(2)
                },
                shipping:{
                  currency_code:this.currency_code,
                  value:'0.00',
                },
                handling:{
                  currency_code:this.currency_code,
                  value:'0.00',
                },
                tax_total:{
                  currency_code:this.currency_code,
                  value:this.totalTax.toFixed(2),
                }
              }
            },
            items:this.items
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
        size: 'responsive'
      },
      onApprove: (data, actions) => {
        //console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then(details => {
          //console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data) => {
        
        if(data.status == 'COMPLETED'){
          this._dataService.changeData(data);
          this.showSuccess = true;
        }
        else{
          this.showSuccess = false;
        }
        //console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        this.priceTaxed = (this.price + this.totalTax).toFixed(2); 
      },
    }
  }

}
