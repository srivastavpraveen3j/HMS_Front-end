import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent {
  @Input() patientData: any;
  @Input()
  title!: String | 'record';
  @Input()
  filter!: String | 'record';
  @Input() activeFilter: string = 'today';
  @Input() startDate!: string;
  @Input() endDate!: string;
}
