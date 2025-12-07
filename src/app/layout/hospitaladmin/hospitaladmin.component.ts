import { Component } from '@angular/core';
import { HospitaladminheaderComponent } from "../hospitaladminheader/hospitaladminheader.component";
import { RouterModule } from '@angular/router';
import { AdminfooterComponent } from "../adminlayout/adminfooter/adminfooter.component";

@Component({
  selector: 'app-hospitaladmin',
  imports: [HospitaladminheaderComponent, RouterModule, AdminfooterComponent],
  templateUrl: './hospitaladmin.component.html',
  styleUrl: './hospitaladmin.component.css',
})
export class HospitaladminComponent {
  isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}
