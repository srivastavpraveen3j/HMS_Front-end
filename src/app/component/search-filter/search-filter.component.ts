import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { RoleService } from '../../views/mastermodule/usermaster/service/role.service';
import { SelectionService } from '../../core/services/opd-filter.service.service';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.css'],
})
export class SearchFilterComponent implements OnInit {
  @Input() role!: string;
  // @Output() onDoctorSelected = new EventEmitter;
  @Output() onDoctorSelected = new EventEmitter<any>();
  @Output() onDoctorIDSelected = new EventEmitter<any>();
  searchControl = new FormControl('');
  filteredUsers: any[] = [];
  showSuggestions = false;
  loading = false;

  // Local "most searched" tracker — always max 10
  private mostSearched: { user: any; count: number }[] = [];

  constructor(
    private roleService: RoleService,
    private selectionService: SelectionService
  ) { }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((term) => {
          const searchTerm = term?.trim() || '';
          if (searchTerm.length >= 3) {
            this.loading = true;
            return this.roleService.searchUser(searchTerm, this.role).pipe(
              catchError(() => of([]))
            );
          } else {
            return of(this.getTopMostSearched());
          }
        })
      )
      .subscribe({
        next: (res: any) => {
          this.filteredUsers = Array.isArray(res) ? res : res?.data || [];
          this.loading = false;

          if (!this.filteredUsers.length) {
            this.filteredUsers = this.getTopMostSearched();
          }
        },
        error: () => (this.loading = false),
      });
  }

  selectUser(user: any): void {
    // debugger
    this.showSuggestions = false;

    this.searchControl.setValue(
      user.name || user.fullName || user.username,
      { emitEvent: false }
    );

    // Track in top 10
    this.addToMostSearched(user);

    // Send to SelectionService
    this.selectionService.setSelectedUser(user);

    // ✅ Emit to parent
    // this.onDoctorSelected.emit(user);
  }


  onFocus(): void {
    this.showSuggestions = true;
    if (!this.searchControl.value?.trim()) {
      this.filteredUsers = this.getTopMostSearched();
    }
  }

  onBlur(): void {
    setTimeout(() => (this.showSuggestions = false), 200);
  }

  // Track user frequency locally (max 10 entries)
  private addToMostSearched(user: any): void {
    const existing = this.mostSearched.find((u) => u.user._id === user._id);
    if (existing) {
      existing.count++;
    } else {
      this.mostSearched.push({ user, count: 1 });
    }

    this.mostSearched.sort((a, b) => b.count - a.count);
    if (this.mostSearched.length > 10) {
      this.mostSearched = this.mostSearched.slice(0, 10);
    }
  }

  // Helper: return only the user objects
  private getTopMostSearched(): any[] {
    return this.mostSearched.map((entry) => entry.user);
  }
}
