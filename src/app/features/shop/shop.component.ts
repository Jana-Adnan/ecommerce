import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';

@Component({
  imports: [SearchComponent],
  selector: 'app-shop',
  template: `<app-search></app-search>`,
})
export class ShopComponent {}
