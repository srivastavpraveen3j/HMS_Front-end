import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from './settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsmoduleService {

  // ✅ BehaviorSubject stores the latest value and emits it to new subscribers
  private settingsSubject = new BehaviorSubject<Settings[]>([]);

  // ✅ Observable to expose safely outside (read-only)
  settings$ = this.settingsSubject.asObservable();

  // ✅ Method to update the settings
  addSettings(settings: Settings[]) {
    this.settingsSubject.next(settings);
  }
}
