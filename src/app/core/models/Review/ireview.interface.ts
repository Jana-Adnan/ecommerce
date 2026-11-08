export interface IReviewRequest {
  review: string;
  rating: number;
}

export interface IReviewUser {
  _id: string;
  name: string;
}

export interface IReview {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: string | IReviewUser;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface IReviewsMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

export interface IReviewsResponse {
  results: number;
  metadata: IReviewsMetadata;
  data: IReview[];
}

export interface IReviewResponse {
  data: IReview;
}