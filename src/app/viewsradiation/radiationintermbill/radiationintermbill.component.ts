import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../component/customcalendar/customcalendar.component';

@Component({
  selector: 'app-radiationintermbill',
  imports: [RouterModule, CommonModule, CustomcalendarComponent],
  templateUrl: './radiationintermbill.component.html',
  styleUrl: './radiationintermbill.component.css'
})
export class RadiationintermbillComponent {

}
