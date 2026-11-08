import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  IReviewRequest,
  IReviewResponse,
  IReviewsResponse
} from '../../models/Review/ireview.interface';

@Service()
export class ReviewsService {
  private _HttpClient = inject(HttpClient);

  CreateReviewForProduct(p_id: string, formData: IReviewRequest): Observable<IReviewResponse> {
    return this._HttpClient.post<IReviewResponse>(
      `${environment.baseURL}/api/v1/products/${p_id}/reviews`,
      formData,
    );
  }

  GetReviewsForProduct(p_id: string): Observable<IReviewsResponse> {
    return this._HttpClient.get<IReviewsResponse>(
      `${environment.baseURL}/api/v1/products/${p_id}/reviews`,
    );
  }

  GetAllReviews(): Observable<IReviewsResponse> {
    return this._HttpClient.get<IReviewsResponse>(`${environment.baseURL}/api/v1/reviews`);
  }

  GetReviewById(r_id: string): Observable<IReviewResponse> {
    return this._HttpClient.get<IReviewResponse>(`${environment.baseURL}/api/v1/reviews/${r_id}`);
  }

  UpdateReview(r_id: string, formData: IReviewRequest): Observable<IReviewResponse> {
    return this._HttpClient.put<IReviewResponse>(
      `${environment.baseURL}/api/v1/reviews/${r_id}`,
      formData,
    );
  }

  DeleteReview(r_id: string): Observable<void> {
    return this._HttpClient.delete<void>(`${environment.baseURL}/api/v1/reviews/${r_id}`);
  }
}