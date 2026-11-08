import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { BrandsService } from '../../core/services/Brand/brands.service';
import { CartService } from '../../core/services/Cart/cart.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { ICategory } from '../../core/models/Category/icategory.interface';
import { IBrand } from '../../core/models/Brand/i-brand.interface';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  private _ProductsService = inject(ProductsService);
  private _CategoriesService = inject(CategoriesService);
  private _BrandsService = inject(BrandsService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _CookieService = inject(CookieService);
  private _ToastrService = inject(ToastrService);
  private _Route = inject(ActivatedRoute);
  private _Router = inject(Router);
  private _PlatformId = inject(PLATFORM_ID);

  // Data signals
  allProducts = signal<IProduct[]>([]);
  categories = signal<ICategory[]>([]);
  brands = signal<IBrand[]>([]);
  wishlistIds = signal<string[]>([]);
  loading = signal<boolean>(true);


  brandParam = signal<string | null>(null);
  activeBrand = signal<IBrand | null>(null);


  categoryParam = signal<string | null>(null);
  activeCategory = signal<ICategory | null>(null);

  categoryDisplayName = computed(() => {
    if (this.activeCategory()?.name) {
      return this.activeCategory()!.name;
    }
    const param = this.categoryParam();
    if (!param || /^[0-9a-fA-F]{24}$/.test(param)) {
      return 'Category';
    }
    return param;
  });

  // Filter signals
  searchQuery = signal<string>('');
  selectedCategories = signal<string[]>([]);
  selectedBrands = signal<string[]>([]);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  selectedPricePreset = signal<number | null>(null);
  sortBy = signal<string>('relevance');
  viewMode = signal<'grid' | 'list'>('grid');


  mobileFiltersOpen = signal<boolean>(false);


  readonly pricePresets = [
    { label: 'Under 500', value: 500 },
    { label: 'Under 1K', value: 1000 },
    { label: 'Under 5K', value: 5000 },
    { label: 'Under 10K', value: 10000 },
  ];


  filteredProducts = computed(() => {
    let list = [...this.allProducts()];
    const query = this.searchQuery().trim().toLowerCase();
    const selCats = this.selectedCategories();
    const selBrands = this.selectedBrands();
    const min = this.minPrice();
    const max = this.maxPrice();
    const sort = this.sortBy();


    if (query) {
      list = list.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(query);
        const catMatch = p.category?.name?.toLowerCase().includes(query);
        const brandMatch = p.brand?.name?.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        return titleMatch || catMatch || brandMatch || descMatch;
      });
    }


    if (this.categoryParam()) {
      const target = this.categoryParam()!;
      const activeName = this.activeCategory()?.name?.toLowerCase();
      const activeSlug = this.activeCategory()?.slug?.toLowerCase();
      list = list.filter((p) => {
        const pCatId = (p.category as any)?._id || (p as any).categoryId;
        const pCatName = p.category?.name?.toLowerCase();
        const pCatSlug = p.category?.slug?.toLowerCase();
        return (
          pCatId === target ||
          (pCatName && pCatName === target.toLowerCase()) ||
          (pCatSlug && pCatSlug === target.toLowerCase()) ||
          (this.activeCategory() && pCatId === this.activeCategory()?._id) ||
          (activeName && pCatName === activeName) ||
          (activeSlug && pCatSlug === activeSlug)
        );
      });
    } else if (selCats.length > 0) {
      list = list.filter((p) =>
        selCats.some((cat) =>
          cat.toLowerCase() === p.category?.name?.toLowerCase() ||
          cat === p.category?._id
        )
      );
    }

    // 3. Brand filter
    if (this.brandParam()) {
      const target = this.brandParam()!;
      const activeName = this.activeBrand()?.name?.toLowerCase();
      list = list.filter((p) => {
        const pBrandId = (p.brand as any)?._id || (p as any).brandId;
        const pBrandName = p.brand?.name?.toLowerCase();
        return (
          pBrandId === target ||
          pBrandName === target.toLowerCase() ||
          (this.activeBrand() && pBrandId === this.activeBrand()?._id) ||
          (activeName && pBrandName === activeName)
        );
      });
    } else if (selBrands.length > 0) {
      list = list.filter((p) =>
        selBrands.some((b) => b.toLowerCase() === p.brand?.name?.toLowerCase())
      );
    }


    if (min !== null && min > 0) {
      list = list.filter((p) => p.price >= min);
    }
    if (max !== null && max > 0) {
      list = list.filter((p) => p.price <= max);
    }


    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
    } else if (sort === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  });

  // Check if any filter is active
  hasActiveFilters = computed(() => {
    return (
      this.searchQuery().trim().length > 0 ||
      this.selectedCategories().length > 0 ||
      this.selectedBrands().length > 0 ||
      this.brandParam() !== null ||
      this.categoryParam() !== null ||
      this.minPrice() !== null ||
      this.maxPrice() !== null ||
      this.selectedPricePreset() !== null
    );
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadWishlist();


    this._Route.queryParams.subscribe((params) => {
      if (params['q'] !== undefined) {
        this.searchQuery.set(params['q'] || '');
      }

      const brand = params['brand'] || null;
      const category = params['category'] || null;

      this.brandParam.set(brand);
      if (brand) {
        this.fetchBrandInfo(brand);
      } else {
        this.activeBrand.set(null);
      }

      this.categoryParam.set(category);
      if (category) {

        const navState = (typeof history !== 'undefined' && history.state?.categoryData) ? history.state.categoryData : null;
        if (navState && (navState._id === category || navState.name === category)) {
          this.activeCategory.set(navState);
        } else {
          this.fetchCategoryInfo(category);
        }
      } else {
        this.activeCategory.set(null);
      }

      this.loadProducts(brand || undefined, category || undefined);
    });
  }

  fetchCategoryInfo(category: string): void {
    if (/^[0-9a-fA-F]{24}$/.test(category)) {
      this._CategoriesService.GetSpecificCategory(category).subscribe({
        next: (res) => {
          if (res?.data) {
            this.activeCategory.set(res.data);
          }
        },
        error: () => {
          const found = this.categories().find(
            (c) =>
              c._id === category ||
              c.name?.toLowerCase() === category.toLowerCase() ||
              c.slug?.toLowerCase() === category.toLowerCase()
          );
          if (found) this.activeCategory.set(found);
        },
      });
    } else {
      const found = this.categories().find(
        (c) =>
          c.name?.toLowerCase() === category.toLowerCase() ||
          c.slug?.toLowerCase() === category.toLowerCase() ||
          c._id === category
      );
      if (found) {
        this.activeCategory.set(found);
      }
    }
  }

  clearCategoryFilter(): void {
    this.categoryParam.set(null);
    this.activeCategory.set(null);
    this.selectedCategories.set([]);
    this._Router.navigate([], {
      relativeTo: this._Route,
      queryParams: { category: null },
      queryParamsHandling: 'merge',
    });
    this.loadProducts(this.brandParam() || undefined);
  }

  fetchBrandInfo(brand: string): void {
    if (/^[0-9a-fA-F]{24}$/.test(brand)) {
      this._BrandsService.GetSpecificBrand(brand).subscribe({
        next: (res) => {
          if (res?.data) {
            this.activeBrand.set(res.data);
          }
        },
        error: () => {
          const found = this.brands().find(
            (b) => b._id === brand || b.name.toLowerCase() === brand.toLowerCase()
          );
          if (found) this.activeBrand.set(found);
        },
      });
    } else {
      const found = this.brands().find(
        (b) =>
          b.name.toLowerCase() === brand.toLowerCase() ||
          b.slug.toLowerCase() === brand.toLowerCase() ||
          b._id === brand
      );
      if (found) {
        this.activeBrand.set(found);
      }
    }
  }

  clearBrandFilter(): void {
    this.brandParam.set(null);
    this.activeBrand.set(null);
    this._Router.navigate([], {
      relativeTo: this._Route,
      queryParams: { brand: null },
      queryParamsHandling: 'merge',
    });
    this.loadProducts(undefined, this.categoryParam() || undefined);
  }

  loadProducts(brandId?: string, categoryId?: string): void {
    this.loading.set(true);
    const params: any = { limit: 60 };
    if (brandId) {
      params['brand'] = brandId;
    }
    if (categoryId) {
      params['category'] = categoryId;
    }

    this._ProductsService.GetAllProducts(params).subscribe({
      next: (res) => {
        const prods = res.data || [];
        this.allProducts.set(prods);


        this.enrichFiltersFromProducts(prods);
        this.loading.set(false);

        if (this.categoryParam() && !this.activeCategory()) {
          this.fetchCategoryInfo(this.categoryParam()!);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadCategories(): void {
    this._CategoriesService.GetAllCategories({ limit: 50 }).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.categories.set(res.data);
          if (this.categoryParam() && !this.activeCategory()) {
            this.fetchCategoryInfo(this.categoryParam()!);
          }
        }
      },
      error: () => {},
    });
  }

  loadBrands(): void {
    this._BrandsService.GetAllBrands({ limit: 50 }).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.brands.set(res.data);
          if (this.brandParam() && !this.activeBrand()) {
            this.fetchBrandInfo(this.brandParam()!);
          }
        }
      },
      error: () => {},
    });
  }

  private enrichFiltersFromProducts(prods: IProduct[]): void {

    const currentCats = new Map(this.categories().map((c) => [c.name.toLowerCase(), c]));
    prods.forEach((p) => {
      if (p.category && p.category.name && !currentCats.has(p.category.name.toLowerCase())) {
        currentCats.set(p.category.name.toLowerCase(), {
          _id: p.category._id || p.category.slug,
          name: p.category.name,
          slug: p.category.slug || p.category.name.toLowerCase(),
          image: p.category.image || '',
          createdAt: '',
          updatedAt: '',
        });
      }
    });
    this.categories.set(Array.from(currentCats.values()));


    const currentBrands = new Map(this.brands().map((b) => [b.name.toLowerCase(), b]));
    prods.forEach((p) => {
      if (p.brand && p.brand.name && !currentBrands.has(p.brand.name.toLowerCase())) {
        currentBrands.set(p.brand.name.toLowerCase(), {
          _id: p.brand._id || p.brand.slug,
          name: p.brand.name,
          slug: p.brand.slug || p.brand.name.toLowerCase(),
          image: p.brand.image || '',
          createdAt: '',
          updatedAt: '',
        });
      }
    });
    this.brands.set(Array.from(currentBrands.values()));
  }

  loadWishlist(): void {
    if (isPlatformBrowser(this._PlatformId) && this._CookieService.get('userToken')) {
      this._WishlistService.GetLoggedUserWishlist().subscribe({
        next: (res) => {
          if (res?.data) {
            const ids = res.data.map((item: any) => item._id || item.id);
            this.wishlistIds.set(ids);
          }
        },
        error: () => {},
      });
    }
  }

  // Search input change handler
  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    // Update URL query parameter
    this._Router.navigate([], {
      relativeTo: this._Route,
      queryParams: { q: value.trim() ? value.trim() : null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this._Router.navigate([], {
      relativeTo: this._Route,
      queryParams: { q: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // Category toggle
  toggleCategory(name: string): void {
    const current = this.selectedCategories();
    const index = current.indexOf(name);
    if (index > -1) {
      this.selectedCategories.set(current.filter((c) => c !== name));
    } else {
      this.selectedCategories.set([...current, name]);
    }
  }

  isCategorySelected(name: string): boolean {
    return this.selectedCategories().includes(name);
  }

  // Brand toggle
  toggleBrand(name: string): void {
    const current = this.selectedBrands();
    const index = current.indexOf(name);
    if (index > -1) {
      this.selectedBrands.set(current.filter((b) => b !== name));
    } else {
      this.selectedBrands.set([...current, name]);
    }
  }

  isBrandSelected(name: string): boolean {
    return this.selectedBrands().includes(name);
  }

  // Price preset handler
  setPricePreset(value: number): void {
    if (this.selectedPricePreset() === value) {
      // Toggle off
      this.selectedPricePreset.set(null);
      this.maxPrice.set(null);
    } else {
      this.selectedPricePreset.set(value);
      this.maxPrice.set(value);
    }
  }

  onMinPriceChange(val: string): void {
    const num = Number(val);
    this.minPrice.set(!isNaN(num) && num > 0 ? num : null);
  }

  onMaxPriceChange(val: string): void {
    const num = Number(val);
    this.maxPrice.set(!isNaN(num) && num > 0 ? num : null);
    this.selectedPricePreset.set(null);
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.brandParam.set(null);
    this.activeBrand.set(null);
    this.categoryParam.set(null);
    this.activeCategory.set(null);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.selectedPricePreset.set(null);
    this.sortBy.set('relevance');

    this._Router.navigate([], {
      relativeTo: this._Route,
      queryParams: {},
      replaceUrl: true,
    });
    this.loadProducts();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  // Wishlist actions
  isInWishlist(productId: string): boolean {
    return this.wishlistIds().includes(productId);
  }

  toggleWishlist(productId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this._CookieService.get('userToken')) {
      this._ToastrService.info('Please log in to manage your wishlist', 'Wishlist');
      return;
    }

    if (this.isInWishlist(productId)) {
      this._WishlistService.RemoveProductFromWishlist(productId).subscribe({
        next: () => {
          this.wishlistIds.update((ids) => ids.filter((id) => id !== productId));
          this._ToastrService.info('Product removed from wishlist', 'Wishlist');
        },
        error: () => {
          this._ToastrService.error('Failed to update wishlist', 'Error');
        },
      });
    } else {
      this._WishlistService.AddProductToWishlist({ productId }).subscribe({
        next: () => {
          this.wishlistIds.update((ids) => [...ids, productId]);
          this._ToastrService.success('Product added to wishlist', 'Wishlist');
        },
        error: () => {
          this._ToastrService.error('Failed to add to wishlist', 'Error');
        },
      });
    }
  }

  onCompare(productTitle: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this._ToastrService.info(`Added "${productTitle}" to comparison`, 'Compare');
  }

  // Add to cart
  addToCart(p_id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!isPlatformBrowser(this._PlatformId)) return;

    if (this._CookieService.get('userToken')) {
      this._CartService.AddProductToCart(p_id).subscribe({
        next: (res) => {
          this._ToastrService.success(res.message || 'Product added to cart', 'Added to cart');
          this._CartService.count.set(res.numOfCartItems);
        },
        error: () => {
          this._ToastrService.error('Could not add to cart', 'Error');
        },
      });
    } else {
      const unLoggedCart = localStorage.getItem('unLoggedCart');
      if (unLoggedCart) {
        let cart = JSON.parse(unLoggedCart);
        if (cart.some((product: any) => product.productId === p_id)) {
          cart = cart.map((product: any) =>
            product.productId === p_id ? { ...product, quantity: product.quantity + 1 } : product
          );
        } else {
          cart.push({ productId: p_id, quantity: 1 });
        }
        localStorage.setItem('unLoggedCart', JSON.stringify(cart));
      } else {
        localStorage.setItem('unLoggedCart', JSON.stringify([{ productId: p_id, quantity: 1 }]));
      }
      this._ToastrService.success('Product added to cart', 'Added to cart');
    }
  }

  // Star ratings helper
  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating || 0);
    return Array(Math.min(fullStars, 5)).fill(0);
  }


  hasDiscount(product: IProduct, index: number): boolean {
    return !!product.priceAfterDiscount || (index % 3 === 0 && product.price > 300);
  }

  getDiscountPercent(product: IProduct, index: number): number {
    if (product.priceAfterDiscount) {
      return Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100);
    }
    const rates = [30, 28, 10, 25, 15, 20];
    return rates[index % rates.length];
  }

  getOriginalPrice(product: IProduct, index: number): number {
    if (product.priceAfterDiscount) {
      return product.price;
    }
    const percent = this.getDiscountPercent(product, index);
    return Math.round(product.price * (1 + percent / 100));
  }
}
