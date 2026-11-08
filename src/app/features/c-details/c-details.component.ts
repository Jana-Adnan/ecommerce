import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-c-details',
  template: `<div class="p-12 text-center text-gray-500">Loading category products...</div>`,
})
export class CDetailsComponent implements OnInit {
  private _Route = inject(ActivatedRoute);
  private _Router = inject(Router);

  ngOnInit(): void {
    const id = this._Route.snapshot.paramMap.get('id');
    if (id) {
      this._Router.navigate(['/products'], {
        queryParams: { category: id },
        replaceUrl: true,
      });
    } else {
      this._Router.navigate(['/categories'], { replaceUrl: true });
    }
  }
}
