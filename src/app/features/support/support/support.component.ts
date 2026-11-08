import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-support',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  isSubmitting = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  showFaq = signal<boolean>(false);
  openFaqIndex = signal<number | null>(null);

  contactForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  readonly faqs: FaqItem[] = [
    {
      q: 'How can I track the status of my order?',
      a: 'Once your order has been dispatched, you will receive a tracking link via email and SMS. You can also view real-time updates directly under your "All Orders" profile page.',
    },
    {
      q: 'What is FreshCart’s return and refund policy?',
      a: 'We offer a hassle-free 14-day return policy for unopened and eligible items. Simply initiate a return from your orders history or contact our support team.',
    },
    {
      q: 'How long does standard delivery take?',
      a: 'Orders within metropolitan areas are typically delivered within 24 to 48 hours. Orders qualifying for same-day delivery are delivered by 8 PM if placed before noon.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD), Visa, MasterCard, and online payments through secure encrypted gateways.',
    },
  ];

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);


    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSubmitted.set(true);
      this.contactForm.reset({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 800);
  }

  resetSuccess(): void {
    this.isSubmitted.set(false);
  }

  toggleFaq(): void {
    this.showFaq.update((val) => !val);
  }

  toggleFaqItem(index: number): void {
    this.openFaqIndex.update((curr) => (curr === index ? null : index));
  }
}
