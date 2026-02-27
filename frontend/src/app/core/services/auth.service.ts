import { Injectable } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    public tokenService: TokenService
  ) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
      tap((response: AuthResponse) => {  // Add type here
        this.handleAuthResponse(response);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registrationData } = userData;
    console.log('Sending to backend:', userData); // For debugging
    
    return this.apiService.post<AuthResponse>('auth/register', userData).pipe(
      tap((response: AuthResponse) => {
        this.handleAuthResponse(response);
      })
    );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.apiService.post<AuthResponse>('auth/refresh', { refreshToken }).pipe(
      tap((response: AuthResponse) => {  // Add type here
        this.tokenService.setTokens(response.token, response.refreshToken);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('auth/me');
  }

private handleAuthResponse(response: AuthResponse): void {
  this.tokenService.setTokens(response.token, response.refreshToken);
  
  const user: User = {
    id: response.userId,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    role: 'user',
    isActive: true,
    createdAt: new Date(),

  };
  
  this.tokenService.setUserData(user);
  this.currentUserSubject.next(user);
  this.isAuthenticatedSubject.next(true);
}

  private checkAuthStatus(): void {
    if (this.tokenService.isAuthenticated()) {
      const user = this.tokenService.getUserData();
      if (user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.role === role;
  }

  // Add this method to your AuthService
updateUserData(updates: Partial<User>): void {
  const currentUser = this.currentUserSubject.value;
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    this.currentUserSubject.next(updatedUser);
    this.tokenService.setUserData(updatedUser);
  }
}
}