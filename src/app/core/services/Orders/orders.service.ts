import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  IOrderShippingAddress,
  ICreateCashOrderResponse,
  IOrdersResponse,
  IOrder
} from '../../models/Order/iorder.interface';

@Service()
export class OrdersService {
  private _HttpClient = inject(HttpClient);

  CreateCashOrderFromCart(
    cartId: string,
    data: IOrderShippingAddress,
  ): Observable<ICreateCashOrderResponse> {
    return this._HttpClient.post<ICreateCashOrderResponse>(
      `${environment.baseURL}/api/v2/orders/${cartId}`,
      { shippingAddress: data },
    );
  }

  GetAllOrders(): Observable<IOrdersResponse> {
    return this._HttpClient.get<IOrdersResponse>(`${environment.baseURL}/api/v1/orders/`);
  }

  GetUserOrders(userId: string): Observable<IOrder[]> {
    return this._HttpClient.get<IOrder[]>(`${environment.baseURL}/api/v1/orders/user/${userId}`);
  }

  CheckoutSession(cartId: string, data: IOrderShippingAddress): Observable<unknown> {
    return this._HttpClient.post<unknown>(
      `${environment.baseURL}/api/v1/orders/checkout-session/${cartId}?url=${environment.domain}`,
      { shippingAddress: data },
    );
  }
}