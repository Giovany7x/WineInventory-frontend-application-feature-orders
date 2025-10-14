import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToolbarLanguageSwitcherComponent } from '../../components/toolbar-language-switcher/toolbar-language-switcher.component';

@Component({
  selector: 'app-workato-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    ToolbarLanguageSwitcherComponent,
    TranslateModule,
  ],
  templateUrl: './workato-shell.component.html',
  styleUrl: './workato-shell.component.css'
})
export class WorkatoShellComponent {
  private readonly translate = inject(TranslateService);
  readonly activeLanguage = signal(this.translate.currentLang || this.translate.getDefaultLang() || 'en');

  onLanguageSelected(language: string) {
    this.translate.use(language);
    this.activeLanguage.set(language);
  }
}
