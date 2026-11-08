export interface ISubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ISubCategoriesMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

export interface ISubCategoriesResponse {
  results: number;
  metadata: ISubCategoriesMetadata;
  data: ISubCategory[];
}

export interface ISpecificSubCategoryResponse {
  data: ISubCategory;
}

export interface ISubCategoriesParams {
  limit?: number;
}