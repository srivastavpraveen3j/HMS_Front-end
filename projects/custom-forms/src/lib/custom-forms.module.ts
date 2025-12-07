import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CrudFormComponent } from './crud-form.component';

@NgModule({
  declarations: [CrudFormComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [CrudFormComponent]
})
export class CustomFormsModule {}
