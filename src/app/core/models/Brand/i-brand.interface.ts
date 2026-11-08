export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface IBrandsMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

export interface IBrandsResponse {
  results: number;
  metadata: IBrandsMetadata;
  data: IBrand[];
}

export interface ISpecificBrandResponse {
  data: IBrand;
}

export interface IBrandsParams {
  limit?: number;
  keyword?: string;
  page?: number;
}