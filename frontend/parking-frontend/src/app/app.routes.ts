import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MapComponent } from './map/map.component';
import { ParkingDetails } from './parking-details/parking-details';
import { ParkingSlot } from './parking-slot/parking-slot';
import { AuthComponent } from './auth/auth';
import { AdminComponent } from './admin/admin';
import { ProfileComponent } from './profile/profile';

const authGuard = () => {
  const router = inject(Router);
  if (!localStorage.getItem('token')) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

const loginGuard = () => {
  const router = inject(Router);
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    router.navigate(['/admin']);
    return false;
  } else if (role === 'user') {
    router.navigate(['/map']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent, canActivate: [loginGuard] },
  { path: 'map', component: MapComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'parking/:name', component: ParkingDetails, canActivate: [authGuard] },
  { path: 'parking2/:name', component: ParkingSlot, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] }
];