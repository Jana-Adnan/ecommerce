import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../../../core/services/Porducts/products.service';
import { IProduct } from '../../../../core/models/Product/iproduct.interface';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/Cart/cart.service';
import { WishlistService } from '../../../../core/services/Wishlist/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';

@Component({
  imports: [RouterLink],
  selector: 'app-home-products',
  styleUrl: './home-products.component.css',
  templateUrl: './home-products.component.html',
})
export class HomeProductsComponent implements OnInit {
  private _ProductsService = inject(ProductsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _CookieService = inject(CookieService);
  private _ToastrService = inject(ToastrService);

  products = signal<IProduct[]>([]);
  wishlistIds = signal<string[]>([]);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.getFeaturedProducts();
    this.loadWishlist();
  }

  getFeaturedProducts(): void {
    this.loading.set(true);

    this._ProductsService.GetAllProducts({ limit: 40 }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadWishlist(): void {
    if (this._CookieService.get('userToken')) {
      this._WishlistService.GetLoggedUserWishlist().subscribe({
        next: (res) => {
          if (res?.data) {
            const ids = res.data.map((item: any) => item._id || item.id);
            this.wishlistIds.set(ids);
          }
        },
        error: () => {}
      });
    }
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistIds().includes(productId);
  }

  toggleWishlist(productId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this._CookieService.get('userToken')) {
      this._ToastrService.info('Please log in to manage your wishlist', 'Wishlist');
      return;
    }

    if (this.isInWishlist(productId)) {
      this._WishlistService.RemoveProductFromWishlist(productId).subscribe({
        next: (res) => {
          this.wishlistIds.update((ids) => ids.filter((id) => id !== productId));
          this._ToastrService.info('Product removed from wishlist', 'Wishlist');
        },
        error: () => {
          this._ToastrService.error('Failed to update wishlist', 'Error');
        }
      });
    } else {
      this._WishlistService.AddProductToWishlist({ productId }).subscribe({
        next: (res) => {
          this.wishlistIds.update((ids) => [...ids, productId]);
          this._ToastrService.success('Product added to wishlist', 'Wishlist');
        },
        error: () => {
          this._ToastrService.error('Failed to add to wishlist', 'Error');
        }
      });
    }
  }

  onCompare(productTitle: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this._ToastrService.info(`Added "${productTitle}" to comparison`, 'Compare');
  }

  addToPorudct(p_id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this._CookieService.get('userToken')) {
      this._CartService.AddProductToCart(p_id).subscribe({
        next: (res) => {
          this._ToastrService.success(res.message || 'Product added to cart', 'Added to cart');
          this._CartService.count.set(res.numOfCartItems);
        },
        error: () => {
          this._ToastrService.error('Could not add to cart', 'Error');
        }
      });
    } else {
      const unLoggedCart = localStorage.getItem('unLoggedCart');
      if (unLoggedCart) {
        let cart = JSON.parse(unLoggedCart);
        if (cart.some((product: any) => product.productId === p_id)) {
          cart = cart.map((product: any) =>
            product.productId === p_id ? { ...product, quantity: product.quantity + 1 } : product
          );
        } else {
          cart.push({ productId: p_id, quantity: 1 });
        }
        localStorage.setItem('unLoggedCart', JSON.stringify(cart));
      } else {
        localStorage.setItem('unLoggedCart', JSON.stringify([{ productId: p_id, quantity: 1 }]));
      }
      this._ToastrService.success('Product added to cart', 'Added to cart');
    }
  }

  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating || 0);
    return Array(Math.min(fullStars, 5)).fill(0);
  }

  hasDiscount(product: IProduct, index: number): boolean {
    return !!product.priceAfterDiscount || (index % 3 === 0 && product.price > 300);
  }

  getDiscountPercent(product: IProduct, index: number): number {
    if (product.priceAfterDiscount) {
      return Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100);
    }
    const rates = [15, 20, 10, 25];
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
