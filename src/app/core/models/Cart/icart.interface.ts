import {
  IProductCategory,
  IProductBrand,
  IProductSubcategory
} from '../Product/iproduct.interface';

export interface IAddProductToCartRequest {
  productId: string;
}

export interface IUpdateCartQuantityRequest {
  count: number;
}

export interface IApplyCouponRequest {
  couponName: string;
}

export interface ICartProduct {
  _id: string;
  title: string;
  slug: string;
  quantity: number;
  imageCover: string;
  category: IProductCategory;
  brand: IProductBrand;
  subcategory: IProductSubcategory[];
  ratingsAverage: number;
  id: string;
}

export interface ICartItem {
  count: number;
  _id: string;
  product: ICartProduct;
  price: number;
}

export interface ICartData {
  _id: string;
  cartOwner: string;
  products: ICartItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalCartPrice: number;
}

export interface ICartResponse {
  status: string;
  message: string;
  numOfCartItems: number;
  cartId: string;
  data: ICartData;
}

export interface IClearCartResponse {
  status: string;
  message: string;
  numOfCartItems: number;
  cartId: string | null;
  data: {
    products: ICartItem[];
    totalCartPrice: number;
  };
}