import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

onSubmit(): void {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  // Send ALL form data including confirmPassword
  const registrationData = {
    firstName: this.registerForm.value.firstName,
    lastName: this.registerForm.value.lastName,
    email: this.registerForm.value.email,
    password: this.registerForm.value.password,
    confirmPassword: this.registerForm.value.confirmPassword
  };

  console.log('Sending to backend:', registrationData); // For debugging

  this.authService.register(registrationData).subscribe({
    next: (response) => {
      console.log('Registration successful:', response);
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Registration error:', error);
      this.errorMessage = error.error?.message || error.message || 'Registration failed. Please try again.';
    }
  });
}
// New method to mark form fields with backend errors
markBackendErrorsOnForm(errors: any): void {
  // Map backend property names to form control names
  const propertyMap: { [key: string]: string } = {
    'FirstName': 'firstName',
    'LastName': 'lastName',
    'Email': 'email',
    'Password': 'password',
    'ConfirmPassword': 'confirmPassword'
  };

  Object.keys(errors).forEach(key => {
    const formControlName = propertyMap[key] || key.toLowerCase();
    const control = this.registerForm.get(formControlName);
    
    if (control) {
      // Set server-side errors on the form control
      control.setErrors({ serverError: errors[key].join ? errors[key].join(', ') : errors[key] });
    }
  });
}
}