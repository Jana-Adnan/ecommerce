import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { ILoggedUser } from '../../models/LoggedUser/ilogged-user.interface';
import {
  IAuthResponse,
  ISignUpData,
  ISignInData,
  IForgotPasswordData,
  IResetCodeData,
  IAuthStatusResponse,
  IChangePasswordData,
  IResetPasswordData,
  IResetPasswordResponse,
  IUpdateUserData,
  IUpdateUserResponse,
  IUsersParams,
  IUsersResponse,
  IVerifyTokenResponse
} from '../../models/Auth/iauth.interface';

@Service()
export class AuthenticationService {
  private _HttpClient = inject(HttpClient);
  private _CookieService = inject(CookieService);

  isLoggin = signal<boolean>(false);
  userInfo = signal<ILoggedUser>({} as ILoggedUser);

  decodeToken() {
    if (this._CookieService.get('userToken')) {
      this.userInfo.set(jwtDecode(this._CookieService.get('userToken')));
    }
  }

  SignUp(formData: ISignUpData): Observable<IAuthResponse> {
    return this._HttpClient.post<IAuthResponse>(
      `${environment.baseURL}/api/v1/auth/signup`,
      formData,
    );
  }

  SignIn(formData: ISignInData): Observable<IAuthResponse> {
    return this._HttpClient.post<IAuthResponse>(
      `${environment.baseURL}/api/v1/auth/signin`,
      formData,
    );
  }

  ForgotPassword(formData: IForgotPasswordData): Observable<IAuthStatusResponse> {
    return this._HttpClient.post<IAuthStatusResponse>(
      `${environment.baseURL}/api/v1/auth/forgotPasswords`,
      formData,
    );
  }

  VerifyResetCode(formData: IResetCodeData): Observable<IAuthStatusResponse> {
    return this._HttpClient.post<IAuthStatusResponse>(
      `${environment.baseURL}/api/v1/auth/verifyResetCode`,
      formData,
    );
  }

  ChangeMyPassword(formData: IChangePasswordData): Observable<IAuthResponse> {
    return this._HttpClient.put<IAuthResponse>(
      `${environment.baseURL}/api/v1/users/changeMyPassword`,
      formData,
    );
  }

  ResetPassword(formData: IResetPasswordData): Observable<IResetPasswordResponse> {
    return this._HttpClient.put<IResetPasswordResponse>(
      `${environment.baseURL}/api/v1/auth/resetPassword`,
      formData
    );
  }

  UpdateMe(formData: IUpdateUserData): Observable<IUpdateUserResponse> {
    return this._HttpClient.put<IUpdateUserResponse>(
      `${environment.baseURL}/api/v1/users/updateMe/`,
      formData,
    );
  }



  VerifyToken(): Observable<IVerifyTokenResponse> {
    return this._HttpClient.get<IVerifyTokenResponse>(
      `${environment.baseURL}/api/v1/auth/verifyToken`,
    );
  }
}