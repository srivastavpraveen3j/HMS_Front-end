import { Component } from '@angular/core';
import { PathoheaderComponent } from "./pathoheader/pathoheader.component";
import { AppComponent } from '../../app.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminfooterComponent } from '../adminlayout/adminfooter/adminfooter.component';

@Component({
  selector: 'app-patholayout',
  imports: [PathoheaderComponent, RouterModule, CommonModule, AdminfooterComponent],
  templateUrl: './patholayout.component.html',
  styleUrl: './patholayout.component.css'
})
export class PatholayoutComponent {

    sidebarCollapsed = false;

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

