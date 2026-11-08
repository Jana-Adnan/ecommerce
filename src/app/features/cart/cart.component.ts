import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../core/services/Cart/cart.service';
import { ICartResponse } from '../../core/models/Cart/icart.interface';
import { RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  imports: [RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.component.css',
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private _CartService = inject(CartService)
  CartDetails = signal<ICartResponse>({} as ICartResponse)

  ngOnInit() {

    this._CartService.GetLoggedUserCart().subscribe({
      next: (res) => {
        this.CartDetails.set(res)
        console.log(this.CartDetails());
      }
    })
  }
  updateCartCount(p_id: string, count: number) {
    if (count < 1) {
      this.removeFromCart(p_id);
      return;
    }
    this._CartService.UpdateCartProductQuantity(p_id, count).subscribe({
      next: (res) => {
        console.log(res);
        this.CartDetails.set(res);
        this._CartService.count.set(res.numOfCartItems);
      },
    });
  }
  removeFromCart(p_id: string) {
    this._CartService.RemoveProductFromCart(p_id).subscribe({
      next: (res) => {
        console.log(res);
        this.CartDetails.set(res);
        this._CartService.count.set(res.numOfCartItems);
      },
    });
  }
  clearCart() {
    this._CartService.ClearUserCart().subscribe({
      next: (res) => {
        console.log(res);
        this.CartDetails.set({} as ICartResponse);
        this._CartService.count.set(0);
      },
    });
  }
}
