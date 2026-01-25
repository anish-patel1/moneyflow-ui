import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/pages/auth/guards/auth.guard';

export const appRoutes: Routes = [
  { 
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        canActivate: [authGuard],
        loadChildren: () => import('./app/pages/pages.routes')
      }
    ]
  },
  { path: 'notfound', component: Notfound },
  { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') }
];
