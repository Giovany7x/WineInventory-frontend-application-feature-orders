import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CatalogItem, MOCK_CATALOG_ITEMS } from '../models/catalog-item.entity';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly catalogSubject = new BehaviorSubject<CatalogItem[]>([...MOCK_CATALOG_ITEMS]);

  getCatalog(): Observable<CatalogItem[]> {
    return this.catalogSubject.asObservable();
  }

  getCatalogSnapshot(): CatalogItem[] {
    return this.catalogSubject.getValue();
  }

  findById(id: string): CatalogItem | undefined {
    return this.getCatalogSnapshot().find(item => item.id === id);
  }
}
