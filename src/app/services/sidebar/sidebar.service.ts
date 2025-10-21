import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

export interface MenuItem {
  label: string;
  icon: string;
  location: string;
  action: string;
  roles: string[];
}
@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  private filterSidebarState = new BehaviorSubject<boolean>(false);
  constructor(private authenticationService: AuthenticationService) { }
  private readonly mainItems: MenuItem[] = [
      {
        label: 'Home',
        icon: 'fas fa-home h2',
        location: '/',
        action: "changeLocation",
        roles: ['guest', 'moderator', 'admin', 'faculty']
      },
      {
        label: 'Moderator View',
        icon: 'fa-solid fa-gauge h2',
        location: '/moderator',
        action: "changeLocation",
        roles: ['moderator', 'admin']
      },
      {
        label: 'Statistics',
        icon: 'fa-solid fa-chart-pie h2',
        location: '/statistics',
        action: "changeLocation",
        roles: ['moderator', 'admin']
      },
      {
        label: 'Semester Management',
        icon: 'fa-solid fa-calendar-days h2',
        location: '/semester',
        action: "changeLocation",
        roles: ['admin']
      },
      {
        label: 'Room Management',
        icon: 'fa-solid fa-building h2',
        location: '/roomManagement',
        action: "changeLocation",
        roles: ['admin']
      },
      {
        label: 'My Bookings',
        icon: 'fa-solid fa-file-signature h2',
        location: '/myBookings',
        action: "changeLocation",
        roles: ['moderator', 'admin']
      },
      {
        label: 'Login',
        icon: 'fa-solid fa-right-to-bracket',
        location: '/login',
        action: "changeLocation",
        roles: ['guest']
      },
      {
        label: 'Logout',
        icon: 'fa-solid fa-arrow-rotate-left',
        location: '',
        action: "logout",
        roles: [ 'moderator', 'admin', 'faculty']
      }
  ];
  readonly filteredItems$: Observable<MenuItem[]> = this.authenticationService.currentUser$.pipe(
    map((user) => {
      if(!this.authenticationService.isAuthenticated()) return this.mainItems.filter((item: MenuItem) => item.roles.includes('guest'));
      const role = user?.roles || ['guest'];
      return this.mainItems.filter((item: MenuItem) => role && item.roles.includes(role.join('')));
    })
  );
  toggle() {
    this.sidebarState.next(!this.sidebarState.value);
  }

  toggleFilterSidebar() {
    this.filterSidebarState.next(!this.sidebarState.value);
  }

  getState(): Observable<boolean> {
    return this.sidebarState.asObservable();
  }

}
