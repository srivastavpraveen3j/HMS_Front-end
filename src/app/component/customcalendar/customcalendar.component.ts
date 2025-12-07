import {
  Component,
  EventEmitter,
  forwardRef,
  HostListener,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-customcalendar',
  standalone: true,
  templateUrl: './customcalendar.component.html',
  styleUrls: ['./customcalendar.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomcalendarComponent),
      multi: true
    }
  ]
})
export class CustomcalendarComponent implements ControlValueAccessor {
  value: string = '';
  isDisabled = false;

  onChange = (value: string) => {};
  onTouched = () => {};

  @Output() dateSelected = new EventEmitter<string>();

  calendarForm: FormGroup = new FormGroup({
    month: new FormControl(new Date().getMonth()),
    year: new FormControl(new Date().getFullYear())
  });

  years: number[] = [];
  calendarDays: (number | null)[] = [];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  selectedDate: number = new Date().getDate();
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  formattedDate: string = '';
  showCalendar: boolean = false;

  ngOnInit() {
    this.initializeYears();
    this.calendarForm.patchValue({
      month: this.selectedMonth,
      year: this.selectedYear
    });
    this.updateCalendar();
    this.updateFormattedDate();
  }

  writeValue(value: string): void {
    this.value = value;
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      this.selectedYear = year;
      this.selectedMonth = month - 1;
      this.selectedDate = day;
      this.calendarForm.patchValue({ month: this.selectedMonth, year: this.selectedYear });
      this.updateCalendar();
      this.updateFormattedDate();
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

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.calendarForm.patchValue({ month: this.selectedMonth, year: this.selectedYear });
    this.updateCalendar();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.calendarForm.patchValue({ month: this.selectedMonth, year: this.selectedYear });
    this.updateCalendar();
  }

  onMonthOrYearChange() {
    this.selectedMonth = this.calendarForm.get('month')?.value;
    this.selectedYear = this.calendarForm.get('year')?.value;
    this.updateCalendar();
  }

  updateCalendar() {
    const firstDay = new Date(this.selectedYear, this.selectedMonth, 1).getDay();
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    this.calendarDays = Array(firstDay).fill(null).concat([...Array(daysInMonth).keys()].map(i => i + 1));
  }

  updateFormattedDate() {
    const month = (this.selectedMonth + 1).toString().padStart(2, '0');
    const day = this.selectedDate.toString().padStart(2, '0');
    const year = this.selectedYear;

    this.value = `${year}-${month}-${day}`;
    this.formattedDate = `${day} ${this.months[this.selectedMonth]} ${year}`;

    this.onChange(this.value);
  }

  setDate(date: number) {
    if (!date) return;
    this.selectedDate = date;
    this.updateFormattedDate();
    this.showCalendar = false;
    this.dateSelected.emit(this.value);
  }

  initializeYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 61 }, (_, i) => currentYear - 50 + i);
  }

  selectToday() {
    const today = new Date();
    this.selectedDate = today.getDate();
    this.selectedMonth = today.getMonth();
    this.selectedYear = today.getFullYear();
    this.calendarForm.patchValue({
      month: this.selectedMonth,
      year: this.selectedYear
    });
    this.updateCalendar();
    this.setDate(this.selectedDate);
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const clickedInside = target.closest('.calendar-container');
    if (!clickedInside) {
      this.showCalendar = false;
    }
  }
}
