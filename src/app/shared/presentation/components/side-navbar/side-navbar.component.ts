import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

export interface NavItem {
  icon: string;
  label: string;
  route: string[];
  isActive?: boolean;
}

@Component({
  selector: 'app-side-navbar',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css']
})
export class SideNavbarComponent implements OnInit {
  isExpanded = true;
  navItems: NavItem[] = [
    { icon: 'home', label: 'side-navbar.options.dashboard', route: ['/dashboard'] },
    { icon: 'inventory_2', label: 'side-navbar.options.wine', route: ['/dashboard', 'products'] },
    { icon: 'shopping_cart', label: 'side-navbar.options.order', route: ['/dashboard', 'sales'] },
    { icon: 'assessment', label: 'side-navbar.options.report', route: ['/dashboard', 'reports'] },
    { icon: 'notifications', label: 'side-navbar.options.alert', route: ['/dashboard', 'alerts'] },
    { icon: 'settings', label: 'side-navbar.options.configuration', route: ['/dashboard', 'profile', 'settings'] }
  ];

  unreadAlerts = 3;

  constructor(private router: Router) {}

  ngOnInit() {
    this.setActiveItem();
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  setActiveItem() {
    const currentRoute = this.router.url;
    this.navItems.forEach(item => {
      item.isActive = item.route.some(route => currentRoute.includes(route));
    });
  }

  onNavItemClick(item: NavItem) {
    this.navItems.forEach(i => i.isActive = false);
    item.isActive = true;
    this.router.navigate(item.route);
  }
  logout() {

    console.log('Cerrando sesión...');
    this.router.navigate(['/sign-in']);
  }
}
