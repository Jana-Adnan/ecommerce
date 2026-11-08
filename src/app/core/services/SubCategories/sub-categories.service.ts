import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  ISubCategoriesParams,
  ISubCategoriesResponse,
  ISpecificSubCategoryResponse
} from '../../models/SubCategory/i-sub-category.interface';

@Service()
export class SubCategoriesService {
  private _HttpClient = inject(HttpClient);

  GetAllSubCategories(params?: ISubCategoriesParams): Observable<ISubCategoriesResponse> {
    let httpParams = new HttpParams();

    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }

    return this._HttpClient.get<ISubCategoriesResponse>(
      `${environment.baseURL}/api/v1/subcategories`,
      { params: httpParams },
    );
  }

  GetSpecificSubCategory(sc_id: string): Observable<ISpecificSubCategoryResponse> {
    return this._HttpClient.get<ISpecificSubCategoryResponse>(
      `${environment.baseURL}/api/v1/subcategories/${sc_id}`,
    );
  }

  GetSubCategoriesOnCategory(c_id: string): Observable<ISubCategoriesResponse> {
    return this._HttpClient.get<ISubCategoriesResponse>(
      `${environment.baseURL}/api/v1/categories/${c_id}/subcategories`,
    );
  }
}