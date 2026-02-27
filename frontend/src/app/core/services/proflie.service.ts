import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadProfileImage(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('userId', userId.toString());

    return this.http.post(`${this.baseUrl}/users/profile-image`, formData);
  }

  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}`);
  }

  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}`, profileData);
  }
}