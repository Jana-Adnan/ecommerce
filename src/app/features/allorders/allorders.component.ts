import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  computed,
} from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { OrdersService } from '../../core/services/Orders/orders.service';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { IOrder } from '../../core/models/Order/iorder.interface';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-allorders',
  styleUrl: './allorders.component.css',
  templateUrl: './allorders.component.html',
})
export class AllordersComponent implements OnInit {
  private _OrdersService = inject(OrdersService);
  private _AuthenticationService = inject(AuthenticationService);
  private _CookieService = inject(CookieService);
  private _platformId = inject(PLATFORM_ID);

  orders = signal<IOrder[]>([]);
  isLoading = signal<boolean>(true);
  isError = signal<boolean>(false);
  expandedOrderIds = signal<Set<number>>(new Set());

  ordersCount = computed(() => this.orders().length);

  ngOnInit(): void {
    if (isPlatformBrowser(this._platformId)) {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.isError.set(false);

    let userId = this._AuthenticationService.userInfo()?.id;

    if (!userId && this._CookieService.get('userToken')) {
      try {
        this._AuthenticationService.decodeToken();
        userId = this._AuthenticationService.userInfo()?.id;
        if (!userId) {
          const decoded: any = jwtDecode(this._CookieService.get('userToken'));
          userId = decoded?.id;
        }
      } catch (err) {
        console.error('Error decoding token', err);
      }
    }

    if (userId) {
      this._OrdersService.GetUserOrders(userId).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          const ordersList: IOrder[] = Array.isArray(res) ? res : (res?.data || []);
          this.orders.set(ordersList);
          if (ordersList.length > 0) {
            this.expandedOrderIds.set(new Set([ordersList[0].id]));
          }
        },
        error: (err) => {
          console.error('Failed to load user orders:', err);
        
          this._OrdersService.GetAllOrders().subscribe({
            next: (res) => {
              this.isLoading.set(false);
              const fallbackList = res?.data || [];
              this.orders.set(fallbackList);
              if (fallbackList.length > 0) {
                this.expandedOrderIds.set(new Set([fallbackList[0].id]));
              }
            },
            error: () => {
              this.isLoading.set(false);
              this.isError.set(true);
            },
          });
        },
      });
    } else {
      this._OrdersService.GetAllOrders().subscribe({
        next: (res) => {
          this.isLoading.set(false);
          const ordersList = res?.data || [];
          this.orders.set(ordersList);
          if (ordersList.length > 0) {
            this.expandedOrderIds.set(new Set([ordersList[0].id]));
          }
        },
        error: (err) => {
          console.error('Failed to load all orders:', err);
          this.isLoading.set(false);
          this.isError.set(true);
        },
      });
    }
  }

  toggleOrder(orderId: number): void {
    this.expandedOrderIds.update((set) => {
      const next = new Set(set);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  isOrderExpanded(orderId: number): boolean {
    return this.expandedOrderIds().has(orderId);
  }

  getTotalItems(order: IOrder): number {
    if (!order.cartItems || order.cartItems.length === 0) return 0;
    return order.cartItems.reduce((acc, item) => acc + (item.count || 1), 0);
  }
}
