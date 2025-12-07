import { Component } from '@angular/core';
import { OpdService } from '../../opdmodule/opdservice/opd.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../mastermodule/masterservice/master.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-opd-medico-legal-case',
  imports: [CommonModule, FormsModule],
  templateUrl: './opd-medico-legal-case.component.html',
  styleUrl: './opd-medico-legal-case.component.css',
})
export class OpdMedicoLegalCaseComponent {
  opdData: any[] = [];
  medicoLegalData: any[] = [];
  filteredDoctors: any[] = [];
  doctorSearchText: string = '';
  selectedDoctorName: string = '';
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';

  recordsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  filteredCases: any[] = [];

  userPermissions: any = {};

  constructor(
    private opdService: OpdService,
    private masterService: MasterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.getAllOpdCases();
    // Permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'medicoLegalCase'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.getMedicoData();
  }

  getMedicoData() {
    this.opdService.getopdedicoLegalCaseapis().subscribe({
      next: (res: any) => {
        console.log('Medical Legal data', res);
        this.medicoLegalData = res.cases || res;
        console.log(this.medicoLegalData);

        this.applyFilters();
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  onDoctorSearchChange(searchText: string) {
    if (searchText.trim().length === 0) {
      // cleared → reset everything
      this.filteredDoctors = [];
      this.selectedDoctorName = '';
      this.currentPage = 1;
      this.getMedicoData(); // show all patients
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    // call API when typing
    this.masterService.getDoctorsByName(searchText).subscribe((res: any) => {
      this.filteredDoctors = res.data?.data || [];
    });
  }

  onDoctorSelected(selectedDoctorName: string) {
    this.selectedDoctorName = selectedDoctorName;
    this.doctorSearchText = selectedDoctorName;
    this.filteredDoctors = []; // close dropdown
    this.currentPage = 1;
    this.getMedicoData();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  applyFilters() {
    // let baseList = this.opdcases;
    let baseList = this.medicoLegalData;

    if (this.selectedDoctorName) {
      baseList = baseList.filter(
        (patient) =>
          patient.consulting_Doctor?.name === this.selectedDoctorName ||
          patient.consulting_Doctor === this.selectedDoctorName
      );
    }

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        return (
          createdAt && new Date(createdAt).toISOString().split('T')[0] === today
        );
      });
    } else if (this.activeFilter === 'dateRange') {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      baseList = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        const date = new Date(createdAt);
        return date >= start && date <= end;
      });
    }

    // Apply pagination manually here
    this.totalPages = Math.ceil(baseList.length / this.recordsPerPage);
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.filteredCases = baseList.slice(startIndex, endIndex);
    console.log('filtered', this.filteredCases);
  }

  editMedicoCase(caseId: string) {
    this.router.navigate(['/opd/opd'], {
      queryParams: { _id: caseId },
    });
  }

  deleteMedicoCase(caseId: string) {
    if (!caseId) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Medico-Legal case will be permanently deleted.',
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
        this.opdService.deleteopdedicoLegalCaseapis(caseId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Medico-Legal case has been deleted successfully.',
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

            this.getMedicoData(); // Refresh the list
          },
          error: (err) => {
            console.error('Error deleting Medico-Legal case:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text:
                err?.error?.message ||
                'There was an error deleting the Medico-Legal case.',
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
}
