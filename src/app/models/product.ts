
/* Defines the product entity */
export interface IProduct {
    id: number;
    name: string;
    category: number;
    price: number;
    quantity: number;
    image: string;
    currency: string;
    tax:number;
}