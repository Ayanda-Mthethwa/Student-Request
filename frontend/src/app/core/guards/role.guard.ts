import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard  {
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(route: any): boolean {
    const userRole = this.tokenService.getUserRole();
    const allowedRoles = route.data?.['roles'] as string[];

    if (!userRole) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles && allowedRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}