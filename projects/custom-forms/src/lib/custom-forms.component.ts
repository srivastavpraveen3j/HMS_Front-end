import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CrudFormService } from './crud-form.service';
import { FieldConfig } from './field-config';

@Component({
  selector: 'custom-crud-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div *ngFor="let field of fields">
        <label>{{ field.label }}</label>

        <input *ngIf="field.type === 'text'" type="text" [formControlName]="field.name">
        <input *ngIf="field.type === 'number'" type="number" [formControlName]="field.name">
        <input *ngIf="field.type === 'date'" type="date" [formControlName]="field.name">

        <select *ngIf="field.type === 'select'" [formControlName]="field.name">
          <option *ngFor="let opt of field.options" [value]="opt.key">{{ opt.value }}</option>
        </select>

        <input *ngIf="field.type === 'checkbox'" type="checkbox" [formControlName]="field.name">
      </div>

      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `
})
export class CrudFormComponent implements OnInit {
  @Input() fields: FieldConfig[] = [];
  @Input() form!: FormGroup;

  constructor(private crudForm: CrudFormService) {}

  ngOnInit() {
    if (!this.form) {
      this.form = this.crudForm.buildForm(this.fields);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      console.log("✅ Custom Form Data:", this.form.value);
    }
  }
}
