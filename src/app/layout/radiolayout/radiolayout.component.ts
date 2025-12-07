import { Component } from '@angular/core';
import { RadioheaderComponent } from "./radioheader/radioheader.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminfooterComponent } from '../adminlayout/adminfooter/adminfooter.component';

@Component({
  selector: 'app-radiolayout',
  imports: [RadioheaderComponent, RouterModule, CommonModule, AdminfooterComponent],
  templateUrl: './radiolayout.component.html',
  styleUrl: './radiolayout.component.css'
})
export class RadiolayoutComponent {
isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}
