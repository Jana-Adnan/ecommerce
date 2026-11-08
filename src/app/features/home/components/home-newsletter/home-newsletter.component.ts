import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-newsletter',
  imports: [FormsModule],
  templateUrl: './home-newsletter.component.html',
  styleUrl: './home-newsletter.component.css'
})
export class HomeNewsletterComponent {
  private _ToastrService = inject(ToastrService);
  emailInput: string = '';

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.emailInput || !this.emailInput.includes('@')) {
      this._ToastrService.warning('Please enter a valid email address', 'Newsletter');
      return;
    }

    this._ToastrService.success(
      'Thank you for subscribing! Check your inbox for exclusive perks.',
      'Subscribed Successfully'
    );
    this.emailInput = '';
  }
}

