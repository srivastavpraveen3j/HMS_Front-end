import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoaderComponent } from '../../../loader/loader.component';
import { VisitTypeService } from '../service/visit.service';
import { MasterService } from '../../../mastermodule/masterservice/master.service';

@Component({
  selector: 'app-visitmasterlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
  ],
  templateUrl: './visitmasterlist.component.html',
  styleUrls: ['./visitmasterlist.component.css'],
})
export class VisitmasterlistComponent implements OnInit {
  recordsPerPage = 10;
  searchText = '';

  visittype: any[] = [];
  visitChargesList: any[] = [];
  procedureChargesList: any[] = [];

  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;

  activeTab: 'visit' | 'procedure' = 'visit';

  module = '';
  userPermissions: any = {};

  // modal state
  isChargeModalOpen = false;
  selectedHead: any = null;
  selectedChargeType: 'visit' | 'procedure' = 'visit';

  // procedure modal state
  procedureRoomTabs: string[] = [];
  selectedRoomTab: string | null = null;
  pagedProcedureServices: any[] = [];
  modalPage = 1;
  modalPageSize = 10;
  modalTotalPages = 1;

  constructor(
    private visittypeservice: VisitTypeService,
    private router: Router,
    private fb: FormBuilder,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'visittypemaster'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.module = uhidModule?.moduleName || '';

    this.filterForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    this.loadVisitTypes();

    this.filterForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadVisitTypes();
    });

    this.filterForm.get('searchText')?.valueChanges.subscribe((val) => {
      this.searchText = val || '';
      this.applyFilters();
    });
  }

  loadVisitTypes(): void {
    const limit = this.filterForm.get('recordsPerPage')?.value || 10;
    const search = this.filterForm.get('searchText')?.value || '';

    this.visittypeservice.getVisitTypes(this.currentPage, limit, search)
      .subscribe((res: any) => {
        this.visittype = res.visitTypes || [];
        this.totalPages = res.totalPages || 1;
        this.buildLists();
        this.applyFilters();
      });
  }

  buildLists(): void {
    this.visitChargesList = this.visittype.filter((x: any) => x.visitType === 'visit');
    this.procedureChargesList = this.visittype.filter(
      (x: any) => x.visitType === 'procedure'
    );
  }

  applyFilters(): void {
    const text = (this.searchText || '').toLowerCase().trim();

    const filterFn = (list: any[]) => {
      if (!text) return list;
      return list.filter((item) => {
        const headName = (item.headName || '').toLowerCase();
        const doctorNamesVisit = (item.doctorRates || [])
          .map((d: any) => (d.doctorId?.name || '').toLowerCase())
          .join(' ');
        const doctorNamesProc = (item.procedureServices || [])
          .map((d: any) => (d.doctorId?.name || '').toLowerCase())
          .join(' ');
        return (
          headName.includes(text) ||
          doctorNamesVisit.includes(text) ||
          doctorNamesProc.includes(text)
        );
      });
    };

    this.visitChargesList = filterFn(
      this.visittype.filter((x: any) => x.visitType === 'visit')
    );
    this.procedureChargesList = filterFn(
      this.visittype.filter((x: any) => x.visitType === 'procedure')
    );
  }

  changeTab(tab: 'visit' | 'procedure'): void {
    this.activeTab = tab;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadVisitTypes();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadVisitTypes();
    }
  }

  editVisitType(id: string): void {
    if (!id) return;
    this.router.navigate(['/master/visittypemaster'], { queryParams: { _id: id } });
  }

  async deleteVisitType(id: string): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    if (!id) {
      console.error('id required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This master will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
        cancelButton: 'hospital-swal-button',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.visittypeservice.deleteVisitTypeMaster(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Record deleted successfully.',
              position: 'top-end',
              toast: true,
              timer: 3000,
              showConfirmButton: false,
              customClass: {
                popup: 'hospital-toast-popup',
                title: 'hospital-toast-title',
                htmlContainer: 'hospital-toast-text',
              },
            });
            this.visittype = this.visittype.filter((x: any) => x._id !== id);
            this.buildLists();
            this.applyFilters();
          },
          error: (err) => {
            console.error('Error deleting:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the record.',
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button',
              },
            });
          },
        });
      }
    });
  }

  // open modal
  openChargeModal(head: any, type: 'visit' | 'procedure'): void {
    this.selectedHead = head;
    this.selectedChargeType = type;
    this.isChargeModalOpen = true;

    if (type === 'procedure') {
      this.setupProcedureRoomTabs();
    }
  }

  closeChargeModal(): void {
    this.isChargeModalOpen = false;
    this.selectedHead = null;
    this.procedureRoomTabs = [];
    this.selectedRoomTab = null;
    this.pagedProcedureServices = [];
    this.modalPage = 1;
    this.modalTotalPages = 1;
  }

  // build room/bed tabs for procedure modal
  private setupProcedureRoomTabs(): void {
    const allServices: any[] = this.selectedHead?.procedureServices || [];

    const roomNamesSet = new Set<string>();
    allServices.forEach((ps) => {
      const roomName =
        ps?.roomTypeId?.name ||
        ps?.bedTypeId?.name ||
        'Unknown';
      roomNamesSet.add(roomName);
    });

    this.procedureRoomTabs = Array.from(roomNamesSet);
    this.selectedRoomTab = this.procedureRoomTabs.length
      ? this.procedureRoomTabs[0]
      : null;

    this.modalPage = 1;
    this.updateProcedureModalPage();
  }

  changeProcedureRoomTab(roomName: string): void {
    if (this.selectedRoomTab === roomName) return;
    this.selectedRoomTab = roomName;
    this.modalPage = 1;
    this.updateProcedureModalPage();
  }

  private updateProcedureModalPage(): void {
    const allServices: any[] = this.selectedHead?.procedureServices || [];
    const currentRoom = this.selectedRoomTab;

    const filtered = currentRoom
      ? allServices.filter((ps) => {
          const rn =
            ps?.roomTypeId?.name ||
            ps?.bedTypeId?.name ||
            'Unknown';
          return rn === currentRoom;
        })
      : allServices;

    const total = filtered.length;
    this.modalTotalPages = Math.max(1, Math.ceil(total / this.modalPageSize));

    const start = (this.modalPage - 1) * this.modalPageSize;
    const end = start + this.modalPageSize;
    this.pagedProcedureServices = filtered.slice(start, end);
  }

  modalNextPage(): void {
    if (this.modalPage < this.modalTotalPages) {
      this.modalPage++;
      this.updateProcedureModalPage();
    }
  }

  modalPreviousPage(): void {
    if (this.modalPage > 1) {
      this.modalPage--;
      this.updateProcedureModalPage();
    }
  }
}
