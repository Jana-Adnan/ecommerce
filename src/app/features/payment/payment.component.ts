import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { OrdersService } from '../../core/services/Orders/orders.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../core/services/Cart/cart.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-payment',
  styleUrl: './payment.component.css',
  templateUrl: './payment.component.html',
})
export class PaymentComponent {
  private _OrdersService = inject(OrdersService);
  private _Router = inject(Router);
  private _ActivatedRoute = inject(ActivatedRoute);
  private _ToastrService = inject(ToastrService);
  private _CartService = inject(CartService);
  @ViewChild('paymentMethod') paymentMethod!: ElementRef;
  cartId = signal<string>('');
  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe((param) => this.cartId.set(param.get('id')!));
  }


  checkOut: FormGroup = new FormGroup({
    details: new FormControl(null, Validators.required),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    city: new FormControl(null, Validators.required),
    postalCode: new FormControl(null, Validators.required),
  });


  submitFormDetails() {
    if (this.checkOut.valid) {
      const paymentMethod = (this.paymentMethod.nativeElement as HTMLInputElement).value;
      console.log(paymentMethod);

      if (paymentMethod == 'cash') {
        this._OrdersService.CreateCashOrderFromCart(this.cartId(), this.checkOut.value).subscribe({
          next: (res) => {
            console.log(res);
            this._CartService.count.set(0);
            this._ToastrService.success(res.message, res.status);
            this._Router.navigate([`/allorders`]);
          },
        });

      } else if (paymentMethod == 'online') {
        this._OrdersService.CheckoutSession(this.cartId(), this.checkOut.value).subscribe({
          next: (res) => {
            console.log(res);
            this._CartService.count.set(0);
            window.open((res as { session: { url: string } }).session.url, '_self');
          },
        });
      }

    }
  }
}
