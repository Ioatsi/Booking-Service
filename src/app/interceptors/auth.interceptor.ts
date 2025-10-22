import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/api/refresh')) {
      return next.handle(req);
    }
    // Get token from localStorage (or wherever you stored it after login)
    const token = this.authenticationService.getToken();
    
    if(!this.authenticationService.isAuthenticated()) {
      return next.handle(req);
    }
    if (this.authenticationService.isTokenExpired()) {
      // Token expired, refresh first
      return this.authenticationService.refreshToken().pipe(
        switchMap(newToken => {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next.handle(cloned);
        })
      );
    } else {
      // Token valid, attach and continue
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }
  }
}