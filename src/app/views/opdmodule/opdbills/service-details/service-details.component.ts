import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { ServiceSelectorComponent } from '../../../../component/service-search/service-search.component';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ServiceSelectorComponent],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.css']
})
export class ServiceDetailsComponent {
  @Input() parentForm!: FormGroup;             // Parent form passed from parent component
  @Output() servicesSelected = new EventEmitter<any[]>(); // Emit selected services to parent

  currentPage = 1;
  totalPages = 1;

  constructor(private fb: FormBuilder) { }

  // ✅ Getter to access the FormArray in parentForm
  get services(): FormArray {
    return this.parentForm.get('services') as FormArray;
  }

  // ✅ Handle service selection
  onServiceSelection(selectedServices: any[]) {
    this.services.clear(); // Clear old selections

    selectedServices.forEach(service => {
      this.services.push(this.fb.group({
        _id: [service._id],
        name: [service.name],
        charge: [service.charge],
        type: [service.type],
        isBilled: [service.isBilled]
      }));
    });

    // Emit to parent if needed
    this.servicesSelected.emit(selectedServices);
  }

  // ✅ Pagination helpers
  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
}
