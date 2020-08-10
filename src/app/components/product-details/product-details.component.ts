import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { APP_CONFIG, IAppConfig } from '../../app_config/app.config';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  public products:any = [];
  public item:any = [];
  currency_code:any;

  constructor(
    @Inject(APP_CONFIG) appConfig: IAppConfig,  
    private route: ActivatedRoute, 
    private _dataService: DataService,) { 
      this.currency_code = appConfig.currency_code;
    }

  ngOnInit() {
    this._dataService.getData();
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this._dataService.product.subscribe(res => {
      if(res.length > 0){
        this.products = res;
        this.getProductById(id, this.products);
      }
    });
  }

  getProductById(id, products){
    this.item = products.find(x => x.id === id);
  }


}
