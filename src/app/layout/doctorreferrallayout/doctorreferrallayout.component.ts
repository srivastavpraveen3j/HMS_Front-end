import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminfooterComponent } from '../adminlayout/adminfooter/adminfooter.component';
import { DoctorreferralheaderComponent } from './doctorreferralheader/doctorreferralheader.component';

@Component({
  selector: 'app-doctorreferrallayout',
  imports: [DoctorreferralheaderComponent, RouterModule, CommonModule, AdminfooterComponent],
  templateUrl: './doctorreferrallayout.component.html',
  styleUrl: './doctorreferrallayout.component.css'
})
export class DoctorreferrallayoutComponent {
isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}
