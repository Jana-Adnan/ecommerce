import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ICategoriesResponse,
  ISpecificCategoryResponse,
  ICategoriesParams,
} from '../../models/Category/icategory.interface';
@Service()
export class CategoriesService {
  private _HttpClient = inject(HttpClient);

  GetAllCategories(params?: ICategoriesParams): Observable<ICategoriesResponse> {
    let httpParams = new HttpParams();

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page);
    }

    if (params?.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }

    return this._HttpClient.get<ICategoriesResponse>(`${environment.baseURL}/api/v1/categories`, {
      params: httpParams,
    });
  }

  GetSpecificCategory(c_id: string): Observable<ISpecificCategoryResponse> {
    return this._HttpClient.get<ISpecificCategoryResponse>(
      `${environment.baseURL}/api/v1/categories/${c_id}`,
    );
  }
}
