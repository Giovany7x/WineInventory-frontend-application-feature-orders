import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-workato-page-not-found',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, TranslateModule],
  templateUrl: './page-not-found.page.html',
  styleUrl: './page-not-found.page.css'
})
export class PageNotFoundPageComponent {
  private readonly router = inject(Router);

  get attemptedUrl(): string {
    return this.router.url;
  }
}
