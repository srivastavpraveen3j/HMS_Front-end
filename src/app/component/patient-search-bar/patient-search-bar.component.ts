import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
  inject
} from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OpdService } from '../../views/opdmodule/opdservice/opd.service';
import { SelectionService } from '../../core/services/opd-filter.service.service';
import { DateFilterService } from '../../core/services/date-filter.service';
@Component({
  selector: 'app-patient-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-search-bar.component.html',
  styleUrls: ['./patient-search-bar.component.css']
})
export class PatientSearchBarComponent implements OnInit, OnChanges {

  // Suggestions coming from parent
  @Input() suggestions: any[] = [];

  // Emit search term to parent
  @Output() search = new EventEmitter<string>();

  // Emit selected patient to parent
  @Output() selectSuggestion = new EventEmitter<any>();

  // Main Input Control
  searchControl = new FormControl('');

  // Controls dropdown visibility
  showList = false;

  private opdservice = inject(OpdService);
  private selectionService = inject(SelectionService);
  private dateFilterService = inject(DateFilterService);
  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(120),
        distinctUntilChanged()
      )
      .subscribe((rawValue: any) => {
        const term = rawValue?.toString().trim() || '';

        // CASE 1: Less than 3 chars → reset search + hide list
        if (term.length < 3) {
          this.search.emit('');
          this.showList = false;
          return;
        }

        // CASE 2: Valid search → send to parent + show list immediately
        this.search.emit(term);
        this.showList = false;               // show while fetching
      });
  }


  // Detect when parent gives new suggestions
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['suggestions']) {
      const term = this.searchControl.value?.toString().trim() || '';

      // Show dropdown ONLY if the user typed at least 3 chars
      if (term.length >= 3 && this.suggestions.length > 0) {
        this.showList = true;
      } else {
        this.showList = false;
      }
    }
  }


  // User focuses input
  onFocus(): void {
    const term = this.searchControl.value?.toString().trim() || '';

    if (term.length >= 3 && this.suggestions.length > 0) {
      this.showList = true;
    }
  }


  // Hide dropdown with slight delay for clickable items
  onBlur(): void {
    setTimeout(() => (this.showList = false), 150);
  }


  // When user selects an item from dropdown
  selectItem(item: any): void {
    // alert("selected")
    // console.log("From Patient Search Bar", item);

    // this.selectSuggestion.emit(item);

    // // Show selected text in the input
    // this.searchControl.setValue(
    //   `${item.patient_name} ${item.mobile_no ? "| " + item.mobile_no : ""} ${item.uhid ? "| " + item.uhid : ""}`
    // );

    // this.opdservice.postOPDcase(opdPayload)
    const selectedDoctor = this.selectionService.getSelectedUser();

    const outpatientCasePayload = {
      uniqueHealthIdentificationId: item.uniqueHealthIdentificationId,
      consulting_Doctor: selectedDoctor,
      caseType: "new"
    };

    this.opdservice.postOPDcase(outpatientCasePayload).subscribe({
      next: res => {
        // this.dateFilterService.setApplyFilter(true);
      },
      error: err => console.error("Error creating case", err),
    });
    this.showList = false;
  }


  // Clear everything
  clearFilters(): void {
    this.searchControl.setValue('');
    this.search.emit('');
    this.showList = false;
  }
}
