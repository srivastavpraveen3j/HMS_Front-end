import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Output } from '@angular/core';
import {  ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customappointmenttimepicker',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './customappointmenttimepicker.component.html',
  styleUrl: './customappointmenttimepicker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomappointmenttimepickerComponent),
      multi: true,
    },
  ],
})
export class CustomappointmenttimepickerComponent
  implements ControlValueAccessor
{
  showTimePicker: boolean = false;
  selectedHour: number = 12;
  selectedMinute: number = 0;
  period: string = 'AM';
  formattedTime: string = '';

  hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
  minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10...55

  onChange: any = () => {};
  onTouched: any = () => {};
  disabled: boolean = false;
  @Output() change = new EventEmitter<string>();

  ngOnInit() {
    this.setCurrentTime();
  }

  onUserSelectTime(hour: string, minute: string) {
    const selectedTime = `${hour}:${minute}`;
    this.change.emit(selectedTime); // ✅ Emit the time string
  }

  setCurrentTime() {
    const now = new Date();
    let hour = now.getHours();
    this.period = hour >= 12 ? 'PM' : 'AM';
    this.selectedHour = hour % 12 || 12;
    this.selectedMinute = Math.round(now.getMinutes() / 5) * 5;
    this.updateFormattedTime();
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

  updateFormattedTime() {
    this.formattedTime = `${this.selectedHour}:${this.selectedMinute
      .toString()
      .padStart(2, '0')} ${this.period}`;
  }

  // closePicker() {
  //   this.updateFormattedTime();
  //   this.showTimePicker = false;
  // }

  // Called by Angular to write a value to the component
  writeValue(value: string): void {
    if (value) {
      const [hourStr, minuteStr] = value.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      this.period = hour >= 12 ? 'PM' : 'AM';
      this.selectedHour = hour % 12 || 12;
      this.selectedMinute = minute;
      this.updateFormattedTime();
    }
  }

  // Angular will call this with a function we call when the value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Angular will call this with a function we call when the input is touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Optional: called when the form wants to disable this input
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ✅ Update closePicker to call onChange:
  closePicker() {
    this.updateFormattedTime();
    this.showTimePicker = false;

    let hour = this.selectedHour;
    if (this.period === 'PM' && hour < 12) {
      hour += 12;
    } else if (this.period === 'AM' && hour === 12) {
      hour = 0;
    }

    const hourStr = hour.toString().padStart(2, '0');
    const minuteStr = this.selectedMinute.toString().padStart(2, '0');
    const selectedTime = `${hourStr}:${minuteStr}`;

    this.change.emit(selectedTime); // Still emit if parent uses (change)
    this.onChange(selectedTime); // ✅ Required for form binding
    this.onTouched(); // ✅ Mark as touched
  }
}
