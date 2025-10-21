import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { jwtDecode } from 'jwt-decode';

export interface User {
  email: string;
  id: number;
  username: string;
  roles: ['admin' | 'moderator' | 'guest' | 'faculty'];
}
export interface JwtPayload {
  exp: number;
  iat: number;
  // add more claims if needed
}
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject = new BehaviorSubject<User | null>(
    {
      email: '',
      id: 0,
      username: 'guest',
      roles: ['guest']
    }
  );

  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  private isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }


  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(environment.apiUrl + '/login', { username, password }).pipe(
      map(response => {
        if (response.status === 'success') {
          this.storeToken(response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        } else {
          console.error(response.message);
        }
        return response;
      })
    );
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  storeToken(token: string) {
    //this.accessToken = token;
    localStorage.setItem('accessToken', token);
    this.isAuthenticated$.next(true);
  }

  getToken(): string | null {
    //return this.accessToken;
    return localStorage.getItem('accessToken');
  }

  clearToken() {
    //this.accessToken = null;
    localStorage.removeItem('accessToken');
    this.isAuthenticated$.next(false);
  }

  isAuthenticated(): any {
    const token = this.getToken();
    return token != null;
  }

  logout(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + '/logout').pipe(
      map(response => {        
        if (response.status === 'success') {
          localStorage.removeItem('user');
          this.currentUserSubject.next(null);
          this.clearToken();

        } else {
          console.error(response.message);
        }
        return response;
      })
    );
  }

  isTokenExpired(): boolean {
    if (!this.getToken()) return true;
    const { exp } = jwtDecode<JwtPayload>(this.getToken()!);
    return Date.now() >= exp * 1000;
  }

  refreshToken(): Observable<string> {
    if (this.isRefreshing) {
      // If a refresh is already in progress, wait for it
      return this.refreshSubject.asObservable().pipe(
        switchMap(token => token ? of(token) : throwError(() => 'No token returned'))
      );
    }

    this.isRefreshing = true;
    this.refreshSubject.next(null);

    return this.http.post<{ access_token: string }>('/api/refresh', {}).pipe(
      map(res => {
        const newToken = res.access_token;
        this.storeToken(newToken);
        this.isRefreshing = false;
        this.refreshSubject.next(newToken);
        return newToken;
      }),
      catchError(err => {
        this.isRefreshing = false;
        this.clearToken();
        this.router.navigate(['/']);
        return throwError(() => err);
      })
    );
  }

}
