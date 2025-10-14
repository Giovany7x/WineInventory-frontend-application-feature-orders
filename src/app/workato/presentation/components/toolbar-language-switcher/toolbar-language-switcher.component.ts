import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-workato-language-switcher',
  standalone: true,
  imports: [MatButtonToggleModule, TranslateModule],
  templateUrl: './toolbar-language-switcher.component.html',
  styleUrl: './toolbar-language-switcher.component.css'
})
export class ToolbarLanguageSwitcherComponent {
  @Input() activeLanguage: string = 'en';
  @Output() languageChange = new EventEmitter<string>();

  onLanguageChange(language: string) {
    this.languageChange.emit(language);
  }
}
