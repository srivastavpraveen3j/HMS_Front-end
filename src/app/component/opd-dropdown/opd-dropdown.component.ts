import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationFilterComponent } from '../pagination-filter/pagination-filter.component';

export interface OPDRecord {
  uniqueHealthIdentificationId: {
    patient_name: string;
    uhid: string;
    age: number;
    [key: string]: any;
  };
  [key: string]: any;
}

@Component({
  selector: 'app-opd-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PaginationFilterComponent],
  templateUrl: './opd-dropdown.component.html',
  styleUrls: ['./opd-dropdown.component.css'],
})
export class OPDDropdownComponent {
  @Input() records: OPDRecord[] = [];
  @Input() emptyText: string = 'No records available.';
  @Output() select = new EventEmitter<OPDRecord>();

  showDropdown = false;
  filterText: string = '';
  currentPage: number = 1;
  pageSize: number = 5;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectRecord(record: OPDRecord) {
    this.select.emit(record);
    this.showDropdown = false;
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  filteredRecords(): OPDRecord[] {
    if (!this.filterText) return this.records;
    return this.records.filter((r) =>
      r.uniqueHealthIdentificationId.patient_name
        ?.toLowerCase()
        .includes(this.filterText.toLowerCase())
    );
  }

  paginatedRecords(): OPDRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredRecords().length / this.pageSize);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
