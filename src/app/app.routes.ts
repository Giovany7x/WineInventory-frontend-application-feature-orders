import { Routes } from '@angular/router';

const SignInComponent = () => import('./authentication/pages/sign-in/sign-in.component').then(m => m.SignInComponent);
const SignUpComponent = () => import('./authentication/pages/sign-up/sign-up.component').then(m => m.SignUpComponent);
const DashboardComponent = () => import('./shared/presentation/view/dashboard/dashboard.component').then(m => m.DashboardComponent);
const PageNotFoundComponent = () => import('./shared/presentation/view/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent);
const ProfileComponent = () => import('./profile/pages/profile/profile.component').then(m => m.ProfileComponent);

const baseTitle = 'WineInventory';

export const routes: Routes = [
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: 'sign-in', loadComponent: SignInComponent, data: { title: `${baseTitle} | Sign In` } },
  { path: 'sign-up', loadComponent: SignUpComponent, data: { title: `${baseTitle} | Sign Up` } },
  { path: 'profile', redirectTo: 'dashboard/profile', pathMatch: 'full' },
  { path: 'profile/settings', redirectTo: 'dashboard/profile/settings', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: DashboardComponent,
    children: [
      { path: '', redirectTo: 'sales', pathMatch: 'full' },
      { path: 'sales', loadChildren: () => import('./orders/orders.routes').then(m => m.ORDERS_ROUTES) },
      { path: 'profile', loadComponent: ProfileComponent, data: { title: `${baseTitle} | Profile` } },
      {
        path: 'profile/settings',
        loadComponent: ProfileComponent,
        data: { title: `${baseTitle} | Profile Settings` }
      },
      { path: 'settings', redirectTo: 'profile/settings', pathMatch: 'full' }
    ]
  },
  { path: '**', loadComponent: PageNotFoundComponent, data: { title: `${baseTitle} | Page Not Found` } }
];
