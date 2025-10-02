import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { CatalogItem } from '../models/catalog-item.entity';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly catalogSubject = new BehaviorSubject<CatalogItem[]>([]);
  private readonly catalogEndpoint = `${environment.apiUrl}/catalog`;

  constructor() {
    this.refreshCatalog().subscribe();
  }

  getCatalog(): Observable<CatalogItem[]> {
    return this.catalogSubject.asObservable();
  }

  getCatalogSnapshot(): CatalogItem[] {
    return this.catalogSubject.getValue();
  }

  findById(id: string): CatalogItem | undefined {
    return this.getCatalogSnapshot().find(item => item.id === id);
  }

  refreshCatalog(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(this.catalogEndpoint).pipe(
      tap({
        next: catalog => this.catalogSubject.next(catalog),
        error: error => console.error('No se pudo cargar el catálogo de productos.', error)
      })
    );
  }
}
