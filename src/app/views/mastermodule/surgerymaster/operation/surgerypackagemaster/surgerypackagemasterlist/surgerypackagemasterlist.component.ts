import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SurgerypackagemasterService } from '../service/surgerypackagemaster.service';
import { IndianCurrencyPipe } from '../../../../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-surgerypackagemasterlist',
  templateUrl: './surgerypackagemasterlist.component.html',
  styleUrls: ['./surgerypackagemasterlist.component.css'],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IndianCurrencyPipe]
})
export class SurgerypackagemasterlistComponent implements OnInit {
  recordsPerPage: number = 25;
  searchText: string = '';
  filterForm!: FormGroup;
  surgery: any[] = [];
  currentPage = 1;
  totalPages = 1;
  userPermissions: any = {};

  constructor(
    private masterService: SurgerypackagemasterService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // load permissions
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'surgeryPackageService');
    this.userPermissions = uhidModule?.permissions || {};

    // Set up filter form
    this.filterForm = this.fb.group({
      recordsPerPage: [this.recordsPerPage],
      searchText: ['']
    });

    this.loadSurgerymaster();

    // Handle filter changes
    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadSurgerymaster();
    });

    this.filterForm.get('searchText')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchText: string) => {
      this.currentPage = 1;
      this.loadSurgerymaster();
    });
  }

  expandedRows: Set<number> = new Set();

loadSurgerymaster(): void {
  const limit = this.filterForm.get('recordsPerPage')?.value || 10;
  const search = this.filterForm.get('searchText')?.value || '';

  this.masterService.getsurgerypackagemasters(this.currentPage, limit, search).subscribe(res => {
    this.surgery = res?.packages ? res.packages : res.data;
    this.totalPages = res.totalPages || 1;

    // Initialize expanded state for each package
    this.surgery.forEach((pkg: any, index: number) => {
      pkg.expanded = this.expandedRows.has(index);
    });
  });
}




toggleExpansion(index: number): void {
  const pkg = this.surgery[index];
  pkg.expanded = !pkg.expanded;

  if (pkg.expanded) {
    this.expandedRows.add(index);
  } else {
    this.expandedRows.delete(index);
  }
}

getRoomTotal(room: any): number {
  const roomCharge = room.roomCharge || 0;
  const nursingCharge = room.nursingCharge || 0;
  const equipmentCharge = room.equipmentCharge || 0;
  const otherCharges = room.otherCharges || 0;

  return roomCharge + nursingCharge + equipmentCharge + otherCharges;
}

// Optional: Expand/Collapse All functionality
expandAll(): void {
  this.surgery.forEach((pkg: any, index: number) => {
    if (pkg.roomWiseBreakdown && pkg.roomWiseBreakdown.length > 0) {
      pkg.expanded = true;
      this.expandedRows.add(index);
    }
  });
}

collapseAll(): void {
  this.surgery.forEach((pkg: any, index: number) => {
    pkg.expanded = false;
  });
  this.expandedRows.clear();
}

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSurgerymaster();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSurgerymaster();
    }
  }

  editSurgery(surgeryId: string) {
    this.router.navigate(['/master/surgerypackagemaster'], { queryParams: { _id: surgeryId } });
  }

  async deleteSurgery(surgeryId: string) {
    const Swal = (await import('sweetalert2')).default;

    if (!surgeryId) {
      console.error("Surgery ID is required for deletion");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This surgery package will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
        cancelButton: 'hospital-swal-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.masterService.deletesurgerypackagemaster(surgeryId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Surgery package has been deleted successfully.',
              position: 'top-end',
              toast: true,
              timer: 3000,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text',
              }
            });
            // Refresh the list after deletion
            this.surgery = this.surgery.filter(item => item._id !== surgeryId);
          },
          error: (err) => {
            console.error("Error deleting surgery:", err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: err?.error?.message || 'There was an error deleting the surgery package.',
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button'
              }
            });
          }
        });
      }
    });
  }

  parseCategory(value: any): string {
    try {
      const arr = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(arr) ? arr.join(', ') : value;
    } catch {
      return value;
    }
  }

  // Updated method to handle the correct data structure
// getRoomTotal(room: any): number {
//   // Since your data shows packagePrice as the main price, use that
//   return room.packagePrice || 0;
// }

// Helper methods for price range (if multiple room types)
getMinPackagePrice(rooms: any[]): number {
  return Math.min(...rooms.map(room => room.packagePrice || 0));
}

getMaxPackagePrice(rooms: any[]): number {
  return Math.max(...rooms.map(room => room.packagePrice || 0));
}

// Alternative: If you want to show breakdown with daily calculation
getCalculatedTotal(room: any, duration: number): number {
  return (room.roomPrice * duration) || room.packagePrice || 0;
}

}
