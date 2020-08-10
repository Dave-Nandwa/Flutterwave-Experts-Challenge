import {
  Injectable
} from '@angular/core';
import {
  BehaviorSubject
} from 'rxjs';
import {
  ProductsService
} from '../services/products.service';
import {
  TaxService
} from '../services/tax.service';
import {
  AngularFirestore
} from '@angular/fire/firestore';
import {
  HttpClient
} from '@angular/common/http';

@Injectable()
export class DataService {

  //PayPal option
  public responseSource = new BehaviorSubject < any > ([]);
  response = this.responseSource.asObservable();
  endpoint: any = `https://us-central1-flutterwave-store.cloudfunctions.net/main`
  constructor(private _productsService: ProductsService, private _taxService: TaxService, private afs: AngularFirestore, private http: HttpClient) {}

  //Response from Paypal
  changeData(data) {
    this.responseSource.next(data);
  }

  public products = [];
  localTax: number = 10;
  dutyTax: number = 5;
  private productSource = new BehaviorSubject < [] > ([]);
  product = this.productSource.asObservable();

  public getData() {
    this._productsService.getProductAPI()
      .subscribe(response => {

          if (response.products) {

            response.products.forEach(e => {

              let taxPrice = this._taxService.calculateTax(e.category, e.price, this.localTax, this.dutyTax, e.imported);

              if (taxPrice) {
                e.price = e.price + (Math.ceil(taxPrice * 20) / 20);
                e.tax = (Math.ceil(taxPrice * 20) / 20);
              } else
                e.tax = 0;

            })
            this.productSource.next((response as any).products);

          }

        },
        error => console.log('Error Products Service - HTTP GET Service', error, error.message)
      )

  }

  /* -------------------------------------------------------------------------- */
  /*            Function Responsible for Uploading Transaction Object           */
  /* -------------------------------------------------------------------------- */
  // will return a promise that i'll resolve on the checkout page
  sendTransactionToDB(data) {
    return this.afs.doc(`transactions/${data.transactionId}`).set(data);
  }

  generateID() {
    return this.afs.createId();
  }

  createVirtualCard(data) {
    return this.http.get(`${this.endpoint}/create-virtual-card`, {
      observe: 'response',
      params: {
        "currency": data.currency,
        "amount": data.amount,
        "name": data.name,
        "address": data.address,
        "city": 'Nairobi',
        "state": 'Nairobi',
        "country": data.countryCode,
        "callback": `${this.endpoint}/cards-hook`
      }
    });
  }

}