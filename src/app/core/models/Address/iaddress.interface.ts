export interface IAddress {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface IAddressRequest {
  name: string;
  details: string;
  phone: string;
  city: string;
}

export interface IAddressActionResponse {
  status: string;
  message: string;
  data: IAddress[];
}

export interface ISpecificAddressResponse {
  status: string;
  data: IAddress;
}

export interface IAddressesResponse {
  results: number;
  status: string;
  data: IAddress[];
}