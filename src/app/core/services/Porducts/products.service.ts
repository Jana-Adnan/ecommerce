import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  IProductsParams,
  IProductsResponse,
  ISpecificProductResponse
} from '../../models/Product/iproduct.interface';

@Service()
export class ProductsService {
  private _HttpClient = inject(HttpClient);

  GetAllProducts(params?: IProductsParams): Observable<IProductsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              httpParams = httpParams.append(key, item);
            });
          } else {
            httpParams = httpParams.set(key, value);
          }
        }
      });
    }

    return this._HttpClient.get<IProductsResponse>(`${environment.baseURL}/api/v1/products`, {
      params: httpParams,
    });
  }

  GetSpecificProduct(p_id: string): Observable<ISpecificProductResponse> {
    return this._HttpClient.get<ISpecificProductResponse>(
      `${environment.baseURL}/api/v1/products/${p_id}`,
    );
  }
}