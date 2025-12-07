import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DoctorReferralModule } from './viewsdoctorreferral/doctorreferral.module';
import { ThemeService } from './views/settingsmodule/themes/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, DoctorReferralModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'hims-frontend';

  // 👇 Example mock state (replace with real state)
  appState = {
    user: { name: 'Test User', role: 'Admin' },
    opdBill: { total: 2000, discount: 100, net: 1900 },
    services: [{ name: 'Consultation', charge: 500 }]
  };

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.loadTheme();
  }
}
