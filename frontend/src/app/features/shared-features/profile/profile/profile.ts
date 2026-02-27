import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { UpdateProfileRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  user: any = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      phoneNumber: ['', [Validators.pattern('^[0-9+\\-\\s]+$')]],
      profilePicture: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }
loadUserProfile(): void {
  this.isLoading = true;
  console.log('Loading user profile...');
  
  this.authService.getCurrentUser().subscribe({
    next: (user) => {
      console.log('Profile loaded:', user);
      this.user = user;
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        profilePicture: user.profilePicture || ''
      });
      this.isLoading = false;  // ✅ Set to false on success
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error loading profile:', error);
      this.isLoading = false;  // ✅ Set to false on error
      
      if (error.status === 401) {
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Failed to load profile. Please try again.';
      }
    }
  });
}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Get only the fields that have values
    const updateData: UpdateProfileRequest = {};
    
    if (this.profileForm.value.firstName && this.profileForm.value.firstName !== this.user.firstName) {
      updateData.firstName = this.profileForm.value.firstName;
    }
    
    if (this.profileForm.value.lastName && this.profileForm.value.lastName !== this.user.lastName) {
      updateData.lastName = this.profileForm.value.lastName;
    }
    
    if (this.profileForm.value.phoneNumber !== this.user.phoneNumber) {
      updateData.phoneNumber = this.profileForm.value.phoneNumber;
    }

    // Handle profile picture upload separately
    if (this.selectedFile) {
      this.uploadProfilePicture(updateData);
    } else {
      this.updateProfile(updateData);
    }
  }

  updateProfile(updateData: UpdateProfileRequest): void {
    this.apiService.put<any>('auth/profile', updateData).subscribe({
      next: (updatedUser) => {
        this.isSaving = false;
        this.successMessage = 'Profile updated successfully!';
        
        // Update local user data
        this.user = updatedUser;
        
        // Update auth service user data
        const currentUser = this.authService['currentUserSubject'].value;
        if (currentUser) {
          const updatedCurrentUser = { ...currentUser, ...updatedUser };
          this.authService['currentUserSubject'].next(updatedCurrentUser);
          this.authService['tokenService'].setUserData(updatedCurrentUser);
        }
        
        // Clear form dirty state
        this.profileForm.markAsPristine();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Failed to update profile';
        console.error('Update error:', error);
      }
    });
  }

  uploadProfilePicture(updateData: UpdateProfileRequest): void {
    const formData = new FormData();
    formData.append('profilePicture', this.selectedFile!);
    
    // If you have a separate endpoint for picture upload
    this.apiService.post<any>('auth/upload-picture', formData).subscribe({
      next: (response) => {
        updateData.profilePicture = response.profilePictureUrl;
        this.updateProfile(updateData);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = 'Failed to upload profile picture';
        console.error('Upload error:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  get canSave(): boolean {
    return this.profileForm.dirty && !this.isSaving;
  }
}