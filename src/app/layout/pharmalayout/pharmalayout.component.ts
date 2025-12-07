import { Component } from '@angular/core';
import { PharmacyreqComponent } from "../../views/doctormodule/pharmacymodule/pharmacyreq/pharmacyreq.component";
import { PharmaheaderComponent } from './pharmaheader/pharmaheader.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminfooterComponent } from '../adminlayout/adminfooter/adminfooter.component';

@Component({
  selector: 'app-pharmalayout',
  imports: [ PharmaheaderComponent, RouterModule, CommonModule, AdminfooterComponent],
  templateUrl: './pharmalayout.component.html',
  styleUrl: './pharmalayout.component.css'
})
export class PharmalayoutComponent {

 isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }
}
