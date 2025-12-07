import { Component } from '@angular/core';
import { RadiationheaderComponent } from "./radiationheader/radiationheader.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-radiationlayout',
  imports: [RadiationheaderComponent, RouterModule],
  templateUrl: './radiationlayout.component.html',
  styleUrl: './radiationlayout.component.css'
})
export class RadiationlayoutComponent {

}
