import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  templateUrl: './debugerpanel.component.html',
  styleUrls: ['./debugerpanel.component.css']
})
export class DebugPanelComponent {
  @Input() data: any;
}
