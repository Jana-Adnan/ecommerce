import {
  AfterViewChecked,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FlowbiteService } from '../../../core/services/flowbite/flowbite.service';
import { initFlowbite } from 'flowbite';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from '../../../core/services/Auth/authentication.service';
import { ILoggedUser } from '../../../core/models/LoggedUser/ilogged-user.interface';
import { CartService } from '../../../core/services/Cart/cart.service';
import { WishlistService } from '../../../core/services/Wishlist/wishlist.service';
import { CategoriesService } from '../../../core/services/Categories/categories.service';
import { ICategory } from '../../../core/models/Category/icategory.interface';
import { isPlatformBrowser } from '@angular/common';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.component.css',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements AfterViewChecked {
  private _FlowbiteService = inject(FlowbiteService);
  private _AuthenticationService = inject(AuthenticationService);
  private _PlatformService = inject(PLATFORM_ID);
  private _CookieService = inject(CookieService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _CategoriesService = inject(CategoriesService);
  private _Router = inject(Router);

  navSearchText = signal<string>('');
  isLogged = computed(() => this._AuthenticationService.isLoggin());
  userDetails = computed(() => this._AuthenticationService.userInfo());
  cartBadge = computed(() => this._CartService.count());
  wishlistBadge = computed(() => this._WishlistService.count());

  categories = signal<ICategory[]>([]);
  isCategoriesDropdownOpen = signal<boolean>(false);
  isMobileCategoriesOpen = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this._PlatformService)) {
      if (this._CookieService.get('userToken')) {
        this._AuthenticationService.isLoggin.set(true);
        this._AuthenticationService.decodeToken();
        this._CartService.getCount();
        this._WishlistService.getCount();
      } else if (localStorage.getItem('unLoggedCart')) {
        let cart = JSON.parse(localStorage.getItem('unLoggedCart')!);
        let cartLength = cart.length;
        this._CartService.count.set(cartLength);
      }
    }

    this.loadCategories();

    this._FlowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }

  ngAfterViewChecked(): void {
    this._FlowbiteService.loadFlowbite((flowbite) => {
      initFlowbite();
    });
  }

  loadCategories(): void {
    this._CategoriesService.GetAllCategories({ limit: 10 }).subscribe({
      next: (res) => {
        if (res?.data && res.data.length > 0) {
          this.categories.set(res.data);
        }
      },
      error: () => {},
    });
  }

  toggleCategoriesDropdown(event: Event): void {
    event.stopPropagation();
    this.isCategoriesDropdownOpen.update((open) => !open);
  }

  closeCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isCategoriesDropdownOpen.set(false);
  }

  onNavSearch(): void {
    const query = this.navSearchText().trim();
    this._Router.navigate(['/search'], {
      queryParams: query ? { q: query } : {},
    });
  }

  logOut() {
    this._CookieService.delete('userToken');
    this._CookieService.delete('userToken', '/');
    this._AuthenticationService.isLoggin.set(false);
    this._AuthenticationService.userInfo.set({} as ILoggedUser);
    this._WishlistService.count.set(0);
    if (localStorage.getItem('unLoggedCart')) {
      let cart = JSON.parse(localStorage.getItem('unLoggedCart')!);
      let cartLength = cart.length;
      this._CartService.count.set(cartLength);
    } else {
      this._CartService.count.set(0);
    }
  }
}
