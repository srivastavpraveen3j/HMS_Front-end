import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { DoctorreferraldashboardComponent } from './doctorreferraldashboard/doctorreferraldashboard.component';
import { ReferraldatalistComponent } from './referraldatalist/referraldatalist.component';

// Pipes
import { GenericHelperPipe } from '../pipe/doctorreferralpipes/generic-helper.pipe';

@NgModule({
  imports: [
    DoctorreferraldashboardComponent,
    ReferraldatalistComponent,
    GenericHelperPipe,
    CommonModule,
    FormsModule,
    GenericHelperPipe
  ],
  exports: [
    DoctorreferraldashboardComponent,
    ReferraldatalistComponent,
    GenericHelperPipe,
  ],
})
export class DoctorReferralModule {}
