import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
          console.error('Client Error:', errorMessage);
        } else {
          // Server-side error
          errorMessage = error.error?.message || error.message || 'Server error';
          console.error(`Server Error: ${error.status} - ${errorMessage}`);

          // Handle specific status codes
          switch (error.status) {
            case 400:
              errorMessage = error.error?.errors?.join(', ') || 'Bad request';
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this action';
              this.router.navigate(['/forbidden']);
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 500:
              errorMessage = 'Internal server error';
              break;
          }
        }

        // You can add a toast/notification service here
        console.error('HTTP Error:', errorMessage);
        
        return throwError(() => ({
          message: errorMessage,
          status: error.status,
          error: error.error
        }));
      })
    );
  }
}