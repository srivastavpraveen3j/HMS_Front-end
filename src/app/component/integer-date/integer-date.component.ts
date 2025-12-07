import {
  Component,
  forwardRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-integer-date',
  standalone: true,
  templateUrl: './integer-date.component.html',
  styleUrls: ['./integer-date.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IntegerDateComponent),
      multi: true
    }
  ]
})
export class IntegerDateComponent implements ControlValueAccessor, OnInit, OnDestroy {
  form = new FormGroup({
    day: new FormControl<number | null>(null),
    month: new FormControl<number | null>(null),
    year: new FormControl<number | null>(null)
  });

  private subscription!: Subscription;

  onChange: (_: any) => void = () => {};
  onTouched: () => void = () => {};

 writeValue(value: Date | string | null): void {
  if (value instanceof Date) {
    const day = value.getDate();
    const month = value.getMonth() + 1;
    const year = value.getFullYear();
    this.form.setValue({ day, month, year }, { emitEvent: false });
  } else if (typeof value === 'string' && value.includes('/')) {
    const [day, month, year] = value.split('/').map(v => parseInt(v, 10));
    this.form.setValue({ day, month, year }, { emitEvent: false });
  } else {
    this.form.reset(undefined, { emitEvent: false });
  }
}


  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  ngOnInit() {
    this.subscription = this.form.valueChanges.subscribe(val => {
      const { day, month, year } = val;

      const isValid =
        Number.isInteger(day) &&
        Number.isInteger(month) &&
        Number.isInteger(year) &&
        day! >= 1 &&
        day! <= 31 &&
        month! >= 1 &&
        month! <= 12 &&
        year! > 1900;

      if (isValid) {
        this.onChange(`${year}-${month}-${day}`);
      } else {
        this.onChange(null);
      }

      // Always call onTouched once user interacts
      this.onTouched();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
