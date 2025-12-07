import { Component } from '@angular/core';
import { StockheaderComponent } from "./stockheader/stockheader.component";
import { AppRoutingModule } from "../../app.routes";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminfooterComponent } from '../adminlayout/adminfooter/adminfooter.component';
import { LogoService } from '../../views/settingsmodule/logo/logo.service';

@Component({
  selector: 'app-stockmanagementlayout',
  standalone: true,
  imports: [StockheaderComponent, RouterModule, CommonModule, AdminfooterComponent],
  templateUrl: './stockmanagementlayout.component.html',
  styleUrl: './stockmanagementlayout.component.css'
})
export class StockmanagementlayoutComponent {

 isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }

}
