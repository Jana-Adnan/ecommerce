import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
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
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { IResetPasswordData } from '../../core/models/Auth/iauth.interface';

@Component({
  selector: 'app-reset-paswword',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-paswword.component.html',
  styleUrl: './reset-paswword.component.css',
})
export class ResetPaswwordComponent implements OnDestroy {
  private _authService = inject(AuthenticationService);
  private _router = inject(Router);
  private _cookieService = inject(CookieService);
  private _toastr = inject(ToastrService);
  private _platformId = inject(PLATFORM_ID);

  step = signal<number>(1);
  isLoading = signal<boolean>(false);
  msgError = signal<string>('');
  isSuccess = signal<boolean>(false);

  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  resendCountdown = signal<number>(0);
  private _timerInterval?: ReturnType<typeof setInterval>;

  // Form controls
  email = new FormControl('', [Validators.required, Validators.email]);
  resetCode = new FormControl('', [Validators.required]);
  newPassword = new FormControl('', [Validators.required, Validators.minLength(6)]);
  confirmPassword = new FormControl('', [Validators.required]);

  step1Form = new FormGroup({
    email: this.email,
  });

  step2Form = new FormGroup({
    resetCode: this.resetCode,
  });

  step3Form = new FormGroup(
    {
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { mismatch: true };
  }

  goToStep(stepNumber: number): void {
    this.msgError.set('');
    this.step.set(stepNumber);
  }

  sendResetCode(): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.msgError.set('');

    const emailVal = this.email.value!.trim();
    this._authService.ForgotPassword({ email: emailVal }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._toastr.success(res.message || 'Reset code sent to your email', 'Code Sent', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });
        this.step.set(2);
        this.startResendCountdown();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.msgError.set(err.error?.message || 'Failed to send reset code');
      },
    });
  }

  verifyCode(): void {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.msgError.set('');

    const codeVal = this.resetCode.value!.trim();
    this._authService.VerifyResetCode({ resetCode: codeVal }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._toastr.success(res.message || 'Code verified successfully', 'Verified', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });
        this.step.set(3);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.msgError.set(err.error?.message || 'Invalid or expired verification code');
      },
    });
  }

  resendCode(): void {
    if (this.resendCountdown() > 0 || this.isLoading()) return;

    this.isLoading.set(true);
    this.msgError.set('');

    const emailVal = this.email.value!.trim();
    this._authService.ForgotPassword({ email: emailVal }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this._toastr.success(res.message || 'New reset code sent to your email', 'Code Resent', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });
        this.startResendCountdown();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.msgError.set(err.error?.message || 'Failed to resend reset code');
      },
    });
  }

  resetPassword(): void {
    if (this.step3Form.invalid) {
      this.step3Form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.msgError.set('');

    const data: IResetPasswordData = {
      email: this.email.value!.trim(),
      newPassword: this.newPassword.value!,
    };

    this._authService.ResetPassword(data).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);

        if (res?.token && isPlatformBrowser(this._platformId)) {
          this._cookieService.set('userToken', res.token);
          this._authService.isLoggin.set(true);
          this._authService.decodeToken();
        }

        this._toastr.success('Password has been reset successfully!', 'Success', {
          progressBar: true,
          closeButton: true,
          timeOut: 4000,
          toastClass: 'myToastr',
        });

        setTimeout(() => {
          this._router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.msgError.set(err.error?.message || 'Failed to reset password');
      },
    });
  }

  startResendCountdown(seconds: number = 60): void {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
    }
    this.resendCountdown.set(seconds);
    this._timerInterval = setInterval(() => {
      if (this.resendCountdown() > 0) {
        this.resendCountdown.update((c) => c - 1);
      } else {
        clearInterval(this._timerInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
    }
  }
}
