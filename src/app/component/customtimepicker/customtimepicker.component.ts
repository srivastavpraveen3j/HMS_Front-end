import {
  Component,
  forwardRef,
  HostListener
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customtimepicker',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './customtimepicker.component.html',
  styleUrl: './customtimepicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomtimepickerComponent),
      multi: true
    }
  ]
})
export class CustomtimepickerComponent implements ControlValueAccessor {
  showTimePicker = false;
  selectedHour = 12;
  selectedMinute = 0;
  period = 'AM';
  formattedTime = '';
  isDisabled = false;

  hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
  minutes = Array.from({ length: 60 }, (_, i) => i);   // 0 to 59

  onChange = (value: string) => {};
  onTouched = () => {};

  ngOnInit() {
    this.setCurrentTime();
  }

  writeValue(value: string): void {
    if (value) {
      const [time, meridian] = value.split(' ');
      const [hourStr, minStr] = time.split(':');
      this.selectedHour = +hourStr;
      this.selectedMinute = +minStr;
      this.period = meridian;
      this.updateFormattedTime();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleTimePicker() {
    this.showTimePicker = !this.showTimePicker;
  }

  setHour(hour: number) {
    this.selectedHour = hour;
    this.closePicker();
  }

  setMinute(minute: number) {
    this.selectedMinute = minute;
    this.closePicker();
  }

  setPeriod(period: string) {
    this.period = period;
    this.closePicker();
  }

  setCurrentTime() {


    
    const now = new Date();
    let hour = now.getHours();
    this.period = hour >= 12 ? 'PM' : 'AM';
    this.selectedHour = hour % 12 || 12;
    this.selectedMinute = now.getMinutes();
    this.updateFormattedTime();
  }

  updateFormattedTime() {
    this.formattedTime = `${this.selectedHour}:${this.selectedMinute.toString().padStart(2, '0')} ${this.period}`;
    this.onChange(this.formattedTime);
  }

  closePicker() {
    this.updateFormattedTime();
    this.showTimePicker = false;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const clickedInside = target.closest('.time-picker-container');
    if (!clickedInside) {
      this.showTimePicker = false;
    }
  }
}
