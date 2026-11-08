import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  IWishlistRequest,
  IWishlistResponse,
  IWishlistProductsResponse
} from '../../models/Wishlist/iwishlist.interface';

@Service()
export class WishlistService {
  private _HttpClient = inject(HttpClient);
  count = signal<number>(0);

  getCount(): void {
    this.GetLoggedUserWishlist().subscribe({
      next: (res) => {
        this.count.set(res.count ?? res.data?.length ?? 0);
      },
      error: () => {
        this.count.set(0);
      },
    });
  }

  AddProductToWishlist(formData: IWishlistRequest): Observable<IWishlistResponse> {
    return this._HttpClient.post<IWishlistResponse>(
      `${environment.baseURL}/api/v1/wishlist`,
      formData,
    ).pipe(
      tap((res) => {
        if (res?.data) {
          this.count.set(res.data.length);
        }
      })
    );
  }

  RemoveProductFromWishlist(p_id: string): Observable<IWishlistResponse> {
    return this._HttpClient.delete<IWishlistResponse>(
      `${environment.baseURL}/api/v1/wishlist/${p_id}`,
    ).pipe(
      tap((res) => {
        if (res?.data) {
          this.count.set(res.data.length);
        }
      })
    );
  }

  GetLoggedUserWishlist(): Observable<IWishlistProductsResponse> {
    return this._HttpClient.get<IWishlistProductsResponse>(
      `${environment.baseURL}/api/v1/wishlist`,
    ).pipe(
      tap((res) => {
        this.count.set(res.count ?? res.data?.length ?? 0);
      })
    );
  }
}
