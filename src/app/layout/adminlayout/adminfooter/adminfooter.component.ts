import { Component } from '@angular/core';

@Component({
  selector: 'app-adminfooter',
  imports: [],
  templateUrl: './adminfooter.component.html',
  styleUrl: './adminfooter.component.css'
})
export class AdminfooterComponent {
currentYear = new Date().getFullYear();
}
