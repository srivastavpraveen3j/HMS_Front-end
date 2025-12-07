import { Component } from '@angular/core';
import { HrmssidebarComponent } from './hrmssidebar/hrmssidebar.component';
import { RouterModule } from '@angular/router';
import { AdminfooterComponent } from '../adminlayout/adminfooter/adminfooter.component';

@Component({
  selector: 'app-hrmslayout',
  imports: [HrmssidebarComponent,RouterModule, AdminfooterComponent],
  templateUrl: './hrmslayout.component.html',
  styleUrl: './hrmslayout.component.css'
})
export class HrmslayoutComponent {

  isCollapsed = false;

  onSidebarCollapseChange(collapsed: boolean) {
    this.isCollapsed = collapsed;
  }

}
