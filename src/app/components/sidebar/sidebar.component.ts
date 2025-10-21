import { Component, OnInit } from '@angular/core';
import { MenuItem, SidebarService } from '../../services/sidebar/sidebar.service';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.less'
})
export class SidebarComponent implements OnInit {
  items$: Observable<MenuItem[]> = this.sidebarService.filteredItems$;
  isOpen = false;

  constructor(public sidebarService: SidebarService, private router: Router, private authenticationService: AuthenticationService) {
    this.sidebarService.getState().subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  ngOnInit() {
  } 

  //Actions
  toggleSidebar() {
    this.sidebarService.toggle();
  }

  changeLocation(location: any) {
    if(location == '/login'){
      this.login();
    }else{
      this.sidebarService.toggle();
      this.router.navigate([location]);
    }
  };
  login(){
    this.router.navigate(['/login']);
  }
  logout(){    
    this.authenticationService.logout().subscribe((response) => {
      this.router.navigate(['/']);
    });
  }
  doAction(item: MenuItem) {
    switch (item.action) {
      case "changeLocation":
        this.changeLocation(item.location);
        break;
      case "logout":
        this.logout();
        break;
    }
  }
}
