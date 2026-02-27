import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: 'login',
        loadComponent: () => import('./features/shared-features/auth/login/login').then(m => m.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/shared-features/auth/register/register').then(m => m.Register)
    },
       {
        path: 'dashboard',
        loadComponent: () => import('./features/shared-features/dashboard/dashboard/dashboard').then(m => m.Dashboard)
    },
           {
        path: 'profile',
        loadComponent: () => import('./features/shared-features/profile/profile/profile').then(m => m.Profile)
    },


    // Default redirect
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }



];
