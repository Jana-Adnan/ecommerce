import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { IChangePasswordData, IUpdateUserData } from '../../core/models/Auth/iauth.interface';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private _authService = inject(AuthenticationService);
  private _cookieService = inject(CookieService);
  private _toastr = inject(ToastrService);
  private _router = inject(Router);
  private _platformId = inject(PLATFORM_ID);

  userId = signal<string>('');
  userRole = signal<string>('User');

  isUpdatingProfile = signal<boolean>(false);
  isChangingPassword = signal<boolean>(false);

  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^01[0125][0-9]{8}$/),
    ]),
  });

  passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      rePassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  ngOnInit(): void {
    if (isPlatformBrowser(this._platformId)) {
      const token = this._cookieService.get('userToken');
      if (token) {
        try {
          this._authService.decodeToken();
          const user = this._authService.userInfo();
          if (user?.id) {
            this.userId.set(user.id);
            this.userRole.set(user.role || 'User');
            if (user.name) {
              this.profileForm.patchValue({ name: user.name });
            }
          } else {
            const decoded: any = jwtDecode(token);
            if (decoded?.id) {
              this.userId.set(decoded.id);
              this.userRole.set(decoded.role || 'User');
              if (decoded.name) {
                this.profileForm.patchValue({ name: decoded.name });
              }
            }
          }
        } catch (err) {
          console.error('Failed to decode user token:', err);
        }
      }
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const rePassword = control.get('rePassword')?.value;
    if (password && rePassword && password !== rePassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((val) => !val);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((val) => !val);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((val) => !val);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile.set(true);
    const data: IUpdateUserData = this.profileForm.value as IUpdateUserData;

    this._authService.UpdateMe(data).subscribe({
      next: (res) => {
        this.isUpdatingProfile.set(false);
        this._toastr.success(res.message || 'Profile updated successfully', 'Success', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });
        if (res.user?.name) {
          this._authService.userInfo.update((prev) => ({
            ...prev,
            name: res.user.name,
          }));
        }
      },
      error: (err) => {
        this.isUpdatingProfile.set(false);
        this._toastr.error(err.error?.message || 'Failed to update profile', 'Error', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    const data: IChangePasswordData = this.passwordForm.value as IChangePasswordData;

    this._authService.ChangeMyPassword(data).subscribe({
      next: (res) => {
        this.isChangingPassword.set(false);
        this._toastr.success('Password changed successfully', 'Success', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });
        if (res.token && isPlatformBrowser(this._platformId)) {
          this._cookieService.set('userToken', res.token);
          this._authService.decodeToken();
        }
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this._toastr.error(err.error?.message || 'Failed to change password', 'Error', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });
      },
    });
  }
}
