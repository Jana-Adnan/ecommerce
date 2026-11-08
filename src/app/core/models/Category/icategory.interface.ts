export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ICategoriesMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
}

export interface ICategoriesResponse {
  results: number;
  metadata: ICategoriesMetadata;
  data: ICategory[];
}

export interface ISpecificCategoryResponse {
  data: ICategory;
}

export interface ICategoriesParams {
  limit?: number;
  page?: number;
  keyword?: string;
}