export interface IProductCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface IProductBrand {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface IProductSubcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

export interface IProduct {
  sold: number;
  images: string[];
  subcategory: IProductSubcategory[];
  ratingsQuantity: number;
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  category: IProductCategory;
  brand: IProductBrand;
  ratingsAverage: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  id: string;
}

export interface IProductReviewUser {
  _id: string;
  name: string;
}

export interface IProductReview {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: IProductReviewUser;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IProductsMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

export interface IProductsResponse {
  results: number;
  metadata: IProductsMetadata;
  data: IProduct[];
}

export interface ISpecificProduct {
  sold: number;
  images: string[];
  subcategory: IProductSubcategory[];
  ratingsQuantity: number;
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  category: IProductCategory;
  brand: IProductBrand;
  ratingsAverage: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  reviews: IProductReview[];
  id: string;
}

export interface ISpecificProductResponse {
  data: ISpecificProduct;
}

export interface IProductsParams {
  limit?: number;
  sort?: string;
  fields?: string;
  'price[gte]'?: number;
  page?: number;
  keyword?: string;
  brand?: string;
  'price[lte]'?: number;
  'category[in]'?: string | string[];
}