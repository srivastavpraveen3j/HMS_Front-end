import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-pagination-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination-filter.component.html',
  styleUrls: ['./pagination-filter.component.css']
})
export class PaginationFilterComponent {
  @Input() ngModel: number = 0;
  @Input() maxLength: number = 0;
  @Output() ngModelChange = new EventEmitter<number>();


  filterText: string = '';

  changePage(newPage: number) {
    this.ngModel = newPage;
    this.ngModelChange.emit(this.ngModel);
  }

  onFilterChange() {
    console.log("Asds")
  }

}
