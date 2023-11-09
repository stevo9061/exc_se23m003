import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;

  constructor(private productService: ProductService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
    this.listProducts();
  });
  }

  // method is invoked once you "subscribe"
  listProducts() {

    // check if "id" parameter is available
    // route -> Use the activated route
    // snapshot -> State of route at this given moment in time
    // paramMap -> Map of all the route parameters
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol, Typescript Trick
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!; /* ! -> this is the non-null assertion operator. */
    }
    else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
    }

    // now get the produts for the given category id
    this.productService.getProductList(this.currentCategoryId).subscribe(
      data => {
        this.products = data; // Assign results to the Product array
      }
    )
  }

}
