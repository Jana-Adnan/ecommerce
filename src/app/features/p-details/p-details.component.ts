
import { Component, inject, signal, computed } from '@angular/core';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { IWishlistRequest } from '../../core/models/Wishlist/iwishlist.interface';
import { CurrencyPipe } from '@angular/common';
import { OwlOptions, CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  imports: [CurrencyPipe, CarouselModule],
  selector: 'app-p-details',
  styleUrl: './p-details.component.css',
  templateUrl: './p-details.component.html',
})
export class PDetailsComponent {
  private _ProductsService = inject(ProductsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _ActivatedRoute = inject(ActivatedRoute);

  p_id = signal<string>('');
  p_details = signal<IProduct>({} as IProduct);

  quantity = signal<number>(1);

  cartMessage = signal<string>('');
  wishlistMessage = signal<string>('');

  totalPrice = computed(() => {
    return this.p_details().price * this.quantity();
  });

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    responsive: {
      0: {
        items: 3
      },
    },
  };

  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe((route) => {
      if (route.get('id')) {
        this.p_id.set(route.get('id')!);
        this.getProduct();
      }
    });
  }

  getProduct() {
    this._ProductsService.GetSpecificProduct(this.p_id()).subscribe({
      next: (res) => {
        this.p_details.set(res.data);
        this.quantity.set(1);
      }
    });
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(value => value - 1);
    }
  }

  increaseQuantity() {
    if (this.quantity() < this.p_details().quantity) {
      this.quantity.update(value => value + 1);
    }
  }

  AddToCart() {
    this.cartMessage.set('');

    this._CartService.AddProductToCart(this.p_id()).subscribe({
      next: (res) => {
        this._CartService.count.set(res.numOfCartItems);
        this.cartMessage.set('Product added to cart successfully');
      },
      error: () => {
        this.cartMessage.set('Failed to add product to cart');
      }
    });
  }

  AddToWishlist() {
    this.wishlistMessage.set('');

    const productData: IWishlistRequest = {
      productId: this.p_id()
    };

    this._WishlistService.AddProductToWishlist(productData).subscribe({
      next: () => {
        this.wishlistMessage.set('Product added to wishlist successfully');
      },
      error: () => {
        this.wishlistMessage.set('Failed to add product to wishlist');
      }
    });
  }
}
