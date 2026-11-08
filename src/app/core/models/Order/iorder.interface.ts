import {
  IProductCategory,
  IProductBrand,
  IProductSubcategory
} from '../Product/iproduct.interface';

export interface IOrderShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
}

export interface ICreateOrderRequest {
  shippingAddress: IOrderShippingAddress;
}

export interface IOrderProduct {
  subcategory: IProductSubcategory[];
  ratingsQuantity?: number;
  _id: string;
  title: string;
  imageCover: string;
  category: IProductCategory;
  brand: IProductBrand;
  ratingsAverage: number;
  id: string;
}

export interface IOrderCartItem {
  count: number;
  _id: string;
  product: IOrderProduct;
  price: number;
}

export interface IOrderUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ICreatedOrderUser {
  id: string;
  name: string;
  email: string;
}

export interface IOrder {
  shippingAddress: IOrderShippingAddress;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: string;
  isPaid: boolean;
  isDelivered: boolean;
  _id: string;
  user: IOrderUser;
  cartItems: IOrderCartItem[];
  createdAt: string;
  updatedAt: string;
  id: number;
  __v?: number;
}

export interface IOrderPricing {
  cartPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
}

export interface ICreateCashOrderResponse {
  status: string;
  message: string;
  user: ICreatedOrderUser;
  pricing: IOrderPricing;
  data: IOrder;
}

export interface IOrdersMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

export interface IOrdersResponse {
  results: number;
  metadata: IOrdersMetadata;
  data: IOrder[];
}