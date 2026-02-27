import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/proflie.service';
import { Subscription } from 'rxjs';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  user: any = null;
  isLoading = true;
  today: Date = new Date();
  isUploading = false;
  uploadMessage = '';
  
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadUserData(): void {
    console.log('Loading real user data...');
    this.isLoading = true;

    // Subscribe to currentUser$ observable to get real user data
    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        console.log('Real user data received:', user);
        
        if (user) {
          this.user = user;
          
          // If user doesn't have profile picture, generate one from initials
          if (!this.user.profilePicture) {
            this.user.profilePicture = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&size=128&background=667eea&color=fff`;
          }
          
          console.log('Dashboard loaded with real user:', this.user);
        } else {
          // No user logged in - redirect to login
          console.log('No user found, redirecting to login...');
          this.router.navigate(['/login']);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.isLoading = false;
        this.router.navigate(['/login']);
      }
    });

    // Also fetch fresh user data from API to ensure it's up to date
    this.refreshUserData();
  }

  refreshUserData(): void {
    this.authService.getCurrentUser().subscribe({
      next: (freshUserData) => {
        console.log('Fresh user data from API:', freshUserData);
        // Update the user data with fresh info from backend
        this.user = { ...this.user, ...freshUserData };
        
        // Update the stored user data
        this.authService.updateUserData(freshUserData);
      },
      error: (error) => {
        console.error('Error fetching fresh user data:', error);
      }
    });
  }

async onProfileImageSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    this.uploadMessage = 'Please select a valid image file (JPEG, PNG, GIF, WEBP)';
    setTimeout(() => this.uploadMessage = '', 3000);
    return;
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    this.uploadMessage = 'Image must be smaller than 2MB';
    setTimeout(() => this.uploadMessage = '', 3000);
    return;
  }

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = () => {
    this.user.profilePicture = reader.result as string;
  };
  reader.readAsDataURL(file);

  // Upload to backend
  this.isUploading = true;
  this.uploadMessage = 'Uploading...';

  try {
    // Get user ID from real user
    const userId = this.user.id;

    if (!userId) {
      throw new Error('User ID not found');
    }

    // Upload the image
    const response = await this.profileService.uploadProfileImage(userId, file).toPromise();

    console.log('Upload successful:', response);

    // Update user data with proper typing
    if (response && response.profilePicture) {
      // Update local user object
      this.user = {
        ...this.user,
        profilePicture: response.profilePicture
      };
      
      // Update auth service with the new profile picture
      this.authService.updateUserData({ 
        profilePicture: response.profilePicture 
      } as Partial<User>); 
    }

    this.uploadMessage = 'Profile image updated successfully!';
    
    // Refresh user data to get latest from backend
    this.refreshUserData();

  } catch (error) {
    console.error('Upload failed:', error);
    this.uploadMessage = 'Upload failed. Please try again.';
  } finally {
    this.isUploading = false;
    setTimeout(() => this.uploadMessage = '', 3000);
  }
}

  logout(): void {
    console.log('Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    if (!this.user) return '';
    return `${this.user.firstName?.charAt(0) || ''}${this.user.lastName?.charAt(0) || ''}`;
  }

  getStatCards(): any[] {
    // You can make this dynamic based on real user data
    return [
      { label: 'Total Requests', value: this.user?.totalRequests || 0, icon: '📋', color: '#667eea' },
      { label: 'Pending', value: this.user?.pendingRequests || 0, icon: '⏳', color: '#fbbf24' },
      { label: 'Approved', value: this.user?.approvedRequests || 0, icon: '✅', color: '#34d399' },
      { label: 'Rejected', value: this.user?.rejectedRequests || 0, icon: '❌', color: '#f87171' }
    ];
  }

  getRecentActivities(): any[] {
    // This could come from a real activities API
    return this.user?.recentActivities || [
      { action: 'Welcome!', details: 'Your account was created', time: 'Just now', icon: '🎉' }
    ];
  }

  // Format date properly
  formatDate(date: any): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
      
    });
  }
}