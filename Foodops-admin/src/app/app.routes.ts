import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { LoginComponent } from './features/auth/pages/login/login';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayout,
    children: [{ path: 'login', component: LoginComponent }],
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
