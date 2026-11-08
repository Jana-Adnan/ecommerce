import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { IProduct } from '../../core/models/Product/iproduct.interface';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  private _WishlistService = inject(WishlistService);
  private _CartService = inject(CartService);
  private _ToastrService = inject(ToastrService);
  private _CookieService = inject(CookieService);
  private _PlatformId = inject(PLATFORM_ID);

  wishlistProducts = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);
  isRemoving = signal<string | null>(null);
  isAddingToCart = signal<string | null>(null);

  itemsCount = computed(() => this.wishlistProducts().length);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    if (!isPlatformBrowser(this._PlatformId)) {
      this.isLoading.set(false);
      return;
    }

    if (!this._CookieService.get('userToken')) {
      this.wishlistProducts.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this._WishlistService.GetLoggedUserWishlist().subscribe({
      next: (res) => {
        this.wishlistProducts.set(res?.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching wishlist:', err);
        this.isLoading.set(false);
      },
    });
  }

  removeFromWishlist(productId: string): void {
    this.isRemoving.set(productId);
    this._WishlistService.RemoveProductFromWishlist(productId).subscribe({
      next: () => {
        this.wishlistProducts.update((products) =>
          products.filter((product) => (product._id || product.id) !== productId)
        );
        this.isRemoving.set(null);
        this._ToastrService.info('Product removed from wishlist', 'Wishlist');
      },
      error: (err) => {
        console.error('Error removing from wishlist:', err);
        this.isRemoving.set(null);
        this._ToastrService.error('Failed to remove item from wishlist', 'Error');
      },
    });
  }

  addToCart(productId: string): void {
    if (!isPlatformBrowser(this._PlatformId)) return;

    this.isAddingToCart.set(productId);

    if (this._CookieService.get('userToken')) {
      this._CartService.AddProductToCart(productId).subscribe({
        next: (res) => {
          this._ToastrService.success(res.message || 'Product added to cart', 'Added to cart');
          this._CartService.count.set(res.numOfCartItems);
          this.isAddingToCart.set(null);
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          this._ToastrService.error('Could not add product to cart', 'Error');
          this.isAddingToCart.set(null);
        },
      });
    } else {
      const unLoggedCart = localStorage.getItem('unLoggedCart');
      if (unLoggedCart) {
        let cart = JSON.parse(unLoggedCart);
        if (cart.some((product: any) => product.productId === productId)) {
          cart = cart.map((product: any) =>
            product.productId === productId ? { ...product, quantity: product.quantity + 1 } : product
          );
        } else {
          cart.push({ productId, quantity: 1 });
        }
        localStorage.setItem('unLoggedCart', JSON.stringify(cart));
        this._CartService.count.set(cart.length);
      } else {
        localStorage.setItem('unLoggedCart', JSON.stringify([{ productId, quantity: 1 }]));
        this._CartService.count.set(1);
      }
      this._ToastrService.success('Product added to cart', 'Added to cart');
      this.isAddingToCart.set(null);
    }
  }


  hasDiscount(product: IProduct, index: number): boolean {
    return !!product.priceAfterDiscount || (index % 3 === 0 && product.price > 300);
  }

  getDiscountPercent(product: IProduct, index: number): number {
    if (product.priceAfterDiscount) {
      return Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100);
    }
    const rates = [30, 28, 10, 25, 15, 20];
    return rates[index % rates.length];
  }

  getOriginalPrice(product: IProduct, index: number): number {
    if (product.priceAfterDiscount) {
      return product.price;
    }
    const percent = this.getDiscountPercent(product, index);
    return Math.round(product.price * (1 + percent / 100));
  }
}
