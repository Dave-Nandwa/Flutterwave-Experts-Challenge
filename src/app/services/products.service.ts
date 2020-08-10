import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG, IAppConfig } from '../app_config/app.config';

@Injectable()
export class ProductsService {

    private _productsUrl: string;
    private headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });

    constructor(@Inject(APP_CONFIG) appConfig: IAppConfig, private _http: HttpClient) {
        this._productsUrl = appConfig.api.products;
    }

    // prod API -> list of products
    getProductAPI() : Observable < any >{
        return this._http
            .get(this._productsUrl, { headers: this.headers });
    }

    postStripe(){
        // return this._http
        //     .post(this._dataUrl, items, { headers: this.headers }).subscribe(
        //       res => { 
        //         this.invoiceNumberSource.next(res as any);
        //       },
        //       error => console.log('Error Products Service - HTTP GET Service', error, error.message)
        //     );
        
    }

}