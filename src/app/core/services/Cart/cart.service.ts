import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ICartResponse,
  IClearCartResponse
} from '../../models/Cart/icart.interface';

@Service()
export class CartService {
  private _HttpClient = inject(HttpClient);
  count = signal<number>(0);

  getCount() {
    this.GetLoggedUserCart().subscribe({
      next: (res) => {
        this.count.set(res.numOfCartItems);
      },
      error: () => {
        this.count.set(0);
      },
    });
  }

  GetLoggedUserCart(): Observable<ICartResponse> {
    return this._HttpClient.get<ICartResponse>(`${environment.baseURL}/api/v2/cart`);
  }

  AddProductToCart(p_id: string): Observable<ICartResponse> {
    return this._HttpClient.post<ICartResponse>(`${environment.baseURL}/api/v2/cart`, {
      productId: p_id,
    });
  }

  UpdateCartProductQuantity(p_id: string, count: number): Observable<ICartResponse> {
    return this._HttpClient.put<ICartResponse>(`${environment.baseURL}/api/v2/cart/${p_id}`, {
      count: count,
    });
  }

  RemoveProductFromCart(p_id: string): Observable<ICartResponse> {
    return this._HttpClient.delete<ICartResponse>(`${environment.baseURL}/api/v2/cart/${p_id}`);
  }

  ClearUserCart(): Observable<IClearCartResponse> {
    return this._HttpClient.delete<IClearCartResponse>(`${environment.baseURL}/api/v2/cart`);
  }

  ApplyCouponToCart(coupon: string): Observable<unknown> {
    return this._HttpClient.put<unknown>(`${environment.baseURL}/api/v2/cart/applyCoupon`, {
      couponName: coupon,
    });
  }
}