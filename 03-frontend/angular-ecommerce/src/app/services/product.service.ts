import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  private baseUrl = 'http://localhost:8080/api/products';

  private categoryUrl = 'http://localhost:8080/api/product-category';

  // Inject HttpClient
  constructor(private httpClient: HttpClient) { }

  // Returns an observable
  // Map the JSON data from Spring Data REST to product array
  getProductList(theCategoryId: number): Observable<Product[]> {

    // need to build URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    // searchUrl needs no 'this' because it is inside the method
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
        map(response => response._embedded.products)
      );
  }

  getProductCategories(): Observable<ProductCategory[]> {
    // 'this' because it is a property of this class
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

}

// Unwraps the JSON from Spring Data REST _embedded entry
interface GetResponseProducts {
  _embedded: {
    products: Product[];
  }
}

// Unwraps the JSON from Spring Data REST _embedded entry
interface GetResponseProductCategory{
  _embedded: {
    productCategory: ProductCategory[];
  }
}
