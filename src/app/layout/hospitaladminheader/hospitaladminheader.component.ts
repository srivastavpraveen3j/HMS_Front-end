import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BroadcastService } from '../../superadminviews/broadcastmessaging/service/broadcast.service';
import { LogoService } from '../../views/settingsmodule/logo/logo.service';

@Component({
  selector: 'app-hospitaladminheader',
  imports: [RouterModule, CommonModule],
  templateUrl: './hospitaladminheader.component.html',
  styleUrl: './hospitaladminheader.component.css',
})
export class HospitaladminheaderComponent {
  unreadCount = 0;
  isCollapsed = false;
  logoUrl!: string;

  constructor(
    private broadcastService: BroadcastService,
    private router: Router,
    private logoService: LogoService
  ) {}

  dropdowns: {
    urm: boolean;
    settings: boolean;
    modules: boolean;
    profile: boolean;
  } = {
    urm: false,
    settings: false,
    modules: false,
    profile: false,
  };

  ngOnInit() {
    this.unreadCount = this.broadcastService.getUnreadCount();

    this.logoService.getLogoMeta().subscribe();

    // 🔥 Subscribe to live updates
    this.logoService.logoUrl$.subscribe((url) => {
      if (url) {
        this.logoUrl = url;
      }
    });
  }

 onLogoError(event: any) {
    event.target.src = 'DigiLogocropped-removebg-preview 1.jpg'; // fallback image
  }

  toggleDropdown(menu: keyof typeof this.dropdowns) {
    // Close all others first
    for (const key in this.dropdowns) {
      if (key !== menu) {
        this.dropdowns[key as keyof typeof this.dropdowns] = false;
      }
    }
    // Toggle the clicked one (open/close)
    this.dropdowns[menu] = !this.dropdowns[menu];
  }
  @Output() collapseChange = new EventEmitter<boolean>();

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;

    // Emit the change to parent component
    this.collapseChange.emit(this.isCollapsed);

    // Close all dropdowns when collapsing
    if (this.isCollapsed) {
      Object.keys(this.dropdowns).forEach(
        (key) => (this.dropdowns[key as keyof typeof this.dropdowns] = false)
      );
    }
  }

  logOut() {
    localStorage.removeItem('authToken');
    this.router.navigateByUrl('/digitalks');
  }
}
