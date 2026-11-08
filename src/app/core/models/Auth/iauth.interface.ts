export interface IAuthUser {
  name: string;
  email: string;
  role: string;
}

export interface IAuthResponse {
  message: string;
  user: IAuthUser;
  token: string;
}

export interface ISignUpData {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  phone: string;
}

export interface ISignInData {
  email: string;
  password: string;
}

export interface IForgotPasswordData {
  email: string;
}

export interface IResetCodeData {
  resetCode: string;
}

export interface IAuthStatusResponse {
  statusMsg: string;
  message: string;
}

export interface IChangePasswordData {
  currentPassword: string;
  password: string;
  rePassword: string;
}

export interface IResetPasswordData {
  email: string;
  newPassword: string;
}

export interface IResetPasswordResponse {
  token: string;
  user?: IAuthUser;
  message?: string;
}

export interface IUpdateUserData {
  name: string;
  email: string;
  phone: string;
}

export interface IUpdateUserResponse {
  message: string;
  user: IAuthUser;
}

export interface IUsersParams {
  limit?: string;
  keyword?: string;
}

export interface IUsersMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface IUsersResponse {
  totalUsers: number;
  metadata: IUsersMetadata;
  users: IUser[];
}

export interface IVerifyTokenResponse {
  message: string;
  decoded: {
    id: string;
    iat: number;
    exp: number;
  };
}