import {
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrandsService } from '../../core/services/Brand/brands.service';
import { IBrand } from '../../core/models/Brand/i-brand.interface';

@Component({
  selector: 'app-brands',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css',
})
export class BrandsComponent implements OnInit {
  private _BrandsService = inject(BrandsService);
  private _Router = inject(Router);
  private _PlatformId = inject(PLATFORM_ID);

  brands = signal<IBrand[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);


  selectedBrand = signal<IBrand | null>(null);
  isModalOpen = signal<boolean>(false);
  isModalLoading = signal<boolean>(false);

  searchQuery = signal<string>('');

  filteredBrands = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.brands();
    }
    return this.brands().filter(
      (brand) =>
        brand.name?.toLowerCase().includes(query) ||
        brand.slug?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this._BrandsService.GetAllBrands({ limit: 50 }).subscribe({
      next: (res) => {
        this.brands.set(res?.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching brands:', err);
        this.errorMessage.set(
          err?.error?.message || 'Failed to load brands. Please check your connection and try again.'
        );
        this.isLoading.set(false);
      },
    });
  }

  onBrandClick(brand: IBrand): void {
    this._Router.navigate(['/products'], {
      queryParams: { brand: brand._id },
    });
  }

  openModal(brand: IBrand): void {
    this.selectedBrand.set(brand);
    this.isModalOpen.set(true);
    this.isModalLoading.set(true);

    this._BrandsService.GetSpecificBrand(brand._id).subscribe({
      next: (res) => {
        if (res?.data) {
          this.selectedBrand.set(res.data);
        }
        this.isModalLoading.set(false);
      },
      error: () => {
        this.isModalLoading.set(false);
      },
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedBrand.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isModalOpen()) {
      this.closeModal();
    }
  }

  navigateToBrandProducts(brandName: string): void {
    this.closeModal();
    this._Router.navigate(['/search'], {
      queryParams: { brand: brandName },
    });
  }
}
