import { Injectable } from '@angular/core';

@Injectable()
export class TaxService {

    constructor() {}

    public calculateTax(category, price, localTax, dutyTax, imported){

        let tax:number = 0;

        if(
            category == "Vases" || 
            category == "Chairs" || 
            category == "Lamp" 
            )
            tax = ( price * localTax ) / 100;   
  
        if (imported)
          tax += (price * dutyTax) / 100;
  
        return tax;
    }

}