import { IProduct } from '../Product/iproduct.interface';

export interface IWishlistRequest {
  productId: string;
}

export interface IWishlistResponse {
  status: string;
  message: string;
  data: string[];
}

export interface IWishlistProductsResponse {
  status?: string;
  count?: number;
  data: IProduct[];
}
