import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FieldConfig } from './field-config';

@Injectable({
  providedIn: 'root'
})
export class CrudFormService {
  constructor(private fb: FormBuilder) {}

  buildForm(fields: FieldConfig[]): FormGroup {
    const group: any = {};
    fields.forEach(field => {
      group[field.name] = [field.value || '', field.validators || []];
    });
    return this.fb.group(group);
  }

  patchForm(form: FormGroup, data: any) {
    form.patchValue(data);
  }

  getFormData(form: FormGroup) {
    return form.getRawValue();
  }

  resetForm(form: FormGroup, defaults: any = {}) {
    form.reset(defaults);
  }
}
