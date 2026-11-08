import { Pipe, PipeTransform } from '@angular/core';
import { IProduct } from '../../../core/models/Product/iproduct.interface';

@Pipe({
  name: 'search',
  standalone: true,
})
export class SearchPipe implements PipeTransform {
  transform(products: IProduct[] | null | undefined, term: string): IProduct[] {
    if (!products || !term) return products || [];
    const lower = term.toLowerCase().trim();
    return products.filter((p) =>
      p.title?.toLowerCase().includes(lower) ||
      p.category?.name?.toLowerCase().includes(lower) ||
      p.brand?.name?.toLowerCase().includes(lower) ||
      p.description?.toLowerCase().includes(lower)
    );
  }
}
