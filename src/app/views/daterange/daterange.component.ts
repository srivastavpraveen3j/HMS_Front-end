import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-daterange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daterange.component.html',
  styleUrl: './daterange.component.css',
})
export class DaterangeComponent {
  @Input() minDate: Date = new Date(2020, 0, 1); // Default min
  @Input() maxDate: Date = new Date(); // Default max

  @Output() dateRangeChanged = new EventEmitter<{
    startDate: string;
    endDate: string;
  }>();

  oneDay = 24 * 60 * 60 * 1000;

  minTimestamp!: number;
  maxTimestamp!: number;
  startTimestamp!: number;
  endTimestamp!: number;

  ngOnInit() {
    this.minTimestamp = this.minDate.getTime();
    this.maxTimestamp = this.maxDate.getTime();
    this.startTimestamp = this.minTimestamp;
    this.endTimestamp = this.maxTimestamp;
  }

  onSliderChange() {
    if (this.startTimestamp > this.endTimestamp) {
      [this.startTimestamp, this.endTimestamp] = [
        this.endTimestamp,
        this.startTimestamp,
      ];
    }

    this.dateRangeChanged.emit({
      startDate: new Date(this.startTimestamp).toISOString().slice(0, 10),
      endDate: new Date(this.endTimestamp).toISOString().slice(0, 10),
    });
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
