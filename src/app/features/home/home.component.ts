import { Component } from '@angular/core';
import { HomeSliderComponent } from './components/home-slider/home-slider.component';
import { HomeCategoriesComponent } from './components/home-categories/home-categories.component';
import { HomePromoBannersComponent } from './components/home-promo-banners/home-promo-banners.component';
import { HomeProductsComponent } from './components/home-products/home-products.component';
import { HomeNewsletterComponent } from './components/home-newsletter/home-newsletter.component';

@Component({
  selector: 'app-home',
  imports: [
    HomeSliderComponent,
    HomeCategoriesComponent,
    HomePromoBannersComponent,
    HomeProductsComponent,
    HomeNewsletterComponent,
  ],
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
