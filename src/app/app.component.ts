import {Component, inject, signal} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {RouterOutlet} from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public readonly title = signal('Workato');
  private translate: TranslateService;

  constructor() {
    this.translate = inject(TranslateService);
    this.translate.addLangs(['en', 'es']);
    this.translate.use('en');
  }
}
