import { Routes } from '@angular/router';

const WorkatoShellComponent = () => import('./workato/presentation/layouts/workato-shell/workato-shell.component').then(m => m.WorkatoShellComponent);
const HomePageComponent = () => import('./workato/presentation/pages/home/home.page').then(m => m.HomePageComponent);
const NewTaskPageComponent = () => import('./workato/presentation/pages/new-task/new-task.page').then(m => m.NewTaskPageComponent);
const PageNotFoundPageComponent = () => import('./workato/presentation/pages/page-not-found/page-not-found.page').then(m => m.PageNotFoundPageComponent);

const baseTitle = 'Workato Intelligent Orchestration Platform';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    loadComponent: WorkatoShellComponent,
    children: [
      { path: 'home', loadComponent: HomePageComponent, data: { title: `${baseTitle} | Home` } },
      { path: 'agents/tasks/new', loadComponent: NewTaskPageComponent, data: { title: `${baseTitle} | New Task` } }
    ]
  },
  { path: '**', loadComponent: PageNotFoundPageComponent, data: { title: `${baseTitle} | Not Found` } }
];
