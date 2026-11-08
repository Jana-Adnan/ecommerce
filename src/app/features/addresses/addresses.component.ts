import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { AddressesService } from '../../core/services/Addresses/addresses.service';
import { IAddress, IAddressRequest } from '../../core/models/Address/iaddress.interface';

@Component({
  selector: 'app-addresses',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css',
})
export class AddressesComponent implements OnInit {
  private _addressesService = inject(AddressesService);
  private _cookieService = inject(CookieService);
  private _toastr = inject(ToastrService);
  private _router = inject(Router);
  private _platformId = inject(PLATFORM_ID);

  addresses = signal<IAddress[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  deletingId = signal<string | null>(null);

  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingAddressId = signal<string | null>(null);

  addressForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    details: new FormControl('', [Validators.required, Validators.minLength(3)]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^01[0125][0-9]{8}$/),
    ]),
    city: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this._platformId)) {
      if (!this._cookieService.get('userToken')) {
        this.isLoading.set(false);
        this._router.navigate(['/login']);
        return;
      }
      this.loadAddresses();
    }
  }

  loadAddresses(): void {
    this.isLoading.set(true);
    this._addressesService.GetLoggedUserAddresses().subscribe({
      next: (res) => {
        this.addresses.set(res?.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load addresses:', err);
        this.isLoading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset();
    this.isModalOpen.set(true);
  }

  openEditModal(address: IAddress): void {
    this.isEditing.set(true);
    this.editingAddressId.set(address._id);
    this.addressForm.patchValue({
      name: address.name,
      details: address.details,
      phone: address.phone,
      city: address.city,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditing.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset();
  }

  submitAddressForm(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const formData: IAddressRequest = {
      name: this.addressForm.value.name?.trim() || '',
      details: this.addressForm.value.details?.trim() || '',
      phone: this.addressForm.value.phone?.trim() || '',
      city: this.addressForm.value.city?.trim() || '',
    };

    this.isSubmitting.set(true);

    if (this.isEditing() && this.editingAddressId()) {
      const currentId = this.editingAddressId()!;
      this._addressesService.RemoveAddress(currentId).subscribe({
        next: () => {
          this._addressesService.AddAddress(formData).subscribe({
            next: (res) => {
              this.addresses.set(res.data || []);
              this.isSubmitting.set(false);
              this.closeModal();
              this._toastr.success('Address updated successfully', 'Success');
            },
            error: (err) => {
              this.isSubmitting.set(false);
              this._toastr.error('Failed to update address', 'Error');
              console.error(err);
            },
          });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this._toastr.error('Failed to update address', 'Error');
          console.error(err);
        },
      });
    } else {
      this._addressesService.AddAddress(formData).subscribe({
        next: (res) => {
          this.addresses.set(res.data || []);
          this.isSubmitting.set(false);
          this.closeModal();
          this._toastr.success(
            res.message || 'Address added successfully',
            'Success'
          );
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this._toastr.error('Failed to add address', 'Error');
          console.error(err);
        },
      });
    }
  }

  deleteAddress(id: string): void {
    if (this.deletingId()) return;

    this.deletingId.set(id);
    this._addressesService.RemoveAddress(id).subscribe({
      next: (res) => {
        this.addresses.set(res.data || []);
        this.deletingId.set(null);
        this._toastr.success(
          res.message || 'Address removed successfully',
          'Success'
        );
      },
      error: (err) => {
        this.deletingId.set(null);
        this._toastr.error('Failed to remove address', 'Error');
        console.error(err);
      },
    });
  }
}
