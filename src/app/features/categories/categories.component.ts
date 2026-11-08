import {
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { ICategory } from '../../core/models/Category/icategory.interface';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  private _CategoriesService = inject(CategoriesService);
  private _Router = inject(Router);
  private _PlatformId = inject(PLATFORM_ID);

  categories = signal<ICategory[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  searchQuery = signal<string>('');

  filteredCategories = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.categories();
    }
    return this.categories().filter(
      (cat) =>
        cat.name?.toLowerCase().includes(query) ||
        cat.slug?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this._CategoriesService.GetAllCategories({ limit: 50 }).subscribe({
      next: (res) => {
        this.categories.set(res?.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.errorMessage.set(
          err?.error?.message ||
          'Failed to load categories. Please check your connection and try again.'
        );
        this.isLoading.set(false);
      },
    });
  }

  onCategoryClick(category: ICategory): void {
    this._Router.navigate(['/products'], {
      queryParams: { category: category._id },
      state: { categoryData: category },
    });
  }
}
