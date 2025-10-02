import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideNavbarComponent } from '../../components/side-navbar/side-navbar.component';
import { LanguageSwitcher } from "../../components/language-switcher/language-switcher.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet, SideNavbarComponent, LanguageSwitcher],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
