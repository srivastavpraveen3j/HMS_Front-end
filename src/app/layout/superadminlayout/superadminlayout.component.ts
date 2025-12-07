import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { RouterModule } from '@angular/router';
import { SuperadminheaderComponent } from './superadminheader/superadminheader.component';
import { AdminfooterComponent } from "../adminlayout/adminfooter/adminfooter.component";

@Component({
  selector: 'app-superadminlayout',
  imports: [SuperadminheaderComponent, RouterModule, AdminfooterComponent],
  templateUrl: './superadminlayout.component.html',
  styleUrl: './superadminlayout.component.css',
})
export class SuperadminlayoutComponent {
  isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}
