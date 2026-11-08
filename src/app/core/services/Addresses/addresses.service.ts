import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  IAddressRequest,
  IAddressActionResponse,
  ISpecificAddressResponse,
  IAddressesResponse
} from '../../models/Address/iaddress.interface';

@Service()
export class AddressesService {
  private _HttpClient = inject(HttpClient);

  AddAddress(formData: IAddressRequest): Observable<IAddressActionResponse> {
    return this._HttpClient.post<IAddressActionResponse>(
      `${environment.baseURL}/api/v1/addresses`,
      formData,
    );
  }

  RemoveAddress(a_id: string): Observable<IAddressActionResponse> {
    return this._HttpClient.delete<IAddressActionResponse>(
      `${environment.baseURL}/api/v1/addresses/${a_id}`,
    );
  }

  GetSpecificAddress(a_id: string): Observable<ISpecificAddressResponse> {
    return this._HttpClient.get<ISpecificAddressResponse>(
      `${environment.baseURL}/api/v1/addresses/${a_id}`,
    );
  }

  GetLoggedUserAddresses(): Observable<IAddressesResponse> {
    return this._HttpClient.get<IAddressesResponse>(`${environment.baseURL}/api/v1/addresses`);
  }
}