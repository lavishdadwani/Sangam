import { Routes } from '@angular/router';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { LoginComponent } from './features/auth/pages/login/login';
import { UsersList } from './features/users/pages/users-list/users-list';
import { RidersList } from './features/riders/pages/riders-list/riders-list';
import { RiderDetail } from './features/riders/pages/rider-detail/rider-detail';
import { RestaurantsList } from './features/restaurants/pages/restaurants-list/restaurants-list';
import { RestaurantDetail } from './features/restaurants/pages/restaurant-detail/restaurant-detail';
import { OrdersList } from './features/orders/pages/orders-list/orders-list';
import { OrderDetail } from './features/orders/pages/order-detail/order-detail';
import { Tracking } from './features/rider-tracking/pages/tracking/tracking';
import { Fleet } from './features/fleet/pages/fleet/fleet';
import { Analytics } from './features/analytics/pages/analytics/analytics';
import { Settings } from './features/settings/pages/settings/settings';
import { ComplaintsList } from './features/complaints/pages/complaints-list/complaints-list';
import { ComplaintDetail } from './features/complaints/pages/complaint-detail/complaint-detail';
import { Notifications } from './features/notifications/pages/notifications/notifications';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [GuestGuard],
    children: [{ path: 'login', component: LoginComponent }],
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: UsersList },
      { path: 'riders', component: RidersList },
      { path: 'riders/:riderId', component: RiderDetail },
      { path: 'restaurants', component: RestaurantsList },
      { path: 'restaurants/:restaurantId', component: RestaurantDetail },
      { path: 'orders', component: OrdersList },
      { path: 'orders/:orderId', component: OrderDetail },
      { path: 'tracking', component: Tracking },
      { path: 'fleet', component: Fleet },
      { path: 'analytics', component: Analytics },
      { path: 'settings', component: Settings },
      { path: 'complaints', component: ComplaintsList },
      { path: 'complaints/:complaintId', component: ComplaintDetail },
      { path: 'notifications', component: Notifications },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
