import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DoctorsharingheaderComponent } from "./doctorsharingheader/doctorsharingheader.component";
import { AdminfooterComponent } from '../adminlayout/adminfooter/adminfooter.component';
import { DoctorreferralheaderComponent } from '../doctorreferrallayout/doctorreferralheader/doctorreferralheader.component';

@Component({
  selector: 'app-doctorsharinglayout',
  imports: [CommonModule, RouterModule, DoctorreferralheaderComponent, CommonModule, AdminfooterComponent],
  templateUrl: './doctorsharinglayout.component.html',
  styleUrl: './doctorsharinglayout.component.css'
})
export class DoctorsharinglayoutComponent {



    sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

}
