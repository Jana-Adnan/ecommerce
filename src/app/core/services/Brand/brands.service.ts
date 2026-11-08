import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  IBrandsParams,
  IBrandsResponse,
  ISpecificBrandResponse
} from '../../models/Brand/i-brand.interface';

@Service()
export class BrandsService {
  private _HttpClient = inject(HttpClient);

  GetAllBrands(params?: IBrandsParams): Observable<IBrandsResponse> {
    let httpParams = new HttpParams();

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }

    if (params?.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page);
    }

    return this._HttpClient.get<IBrandsResponse>(`${environment.baseURL}/api/v1/brands`, {
      params: httpParams,
    });
  }

  GetSpecificBrand(b_id: string): Observable<ISpecificBrandResponse> {
    return this._HttpClient.get<ISpecificBrandResponse>(
      `${environment.baseURL}/api/v1/brands/${b_id}`,
    );
  }
}