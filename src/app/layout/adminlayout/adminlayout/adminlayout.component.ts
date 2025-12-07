import { Component, ViewChild } from '@angular/core';
import { AdminheaderComponent } from "../adminheader/adminheader.component";
import { AdminfooterComponent } from "../adminfooter/adminfooter.component";
import { AppComponent } from "../../../app.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adminlayout',
  imports: [AdminheaderComponent, AdminfooterComponent, RouterModule, CommonModule],
  templateUrl: './adminlayout.component.html',
  styleUrl: './adminlayout.component.css'
})
export class AdminlayoutComponent {

isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }

}
