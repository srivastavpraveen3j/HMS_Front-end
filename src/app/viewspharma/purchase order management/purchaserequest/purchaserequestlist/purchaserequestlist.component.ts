import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientInfoComponentComponent } from "../../../../component/opdcustomfiles/patient-info-component/patient-info-component.component";
import { PatientdeatailsComponent } from "../../../../component/opdcustomfiles/patientdeatails/patientdeatails.component";
import Swal from 'sweetalert2';
import { MaterialrequestService } from '../service/materialrequest.service';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-purchaserequestlist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchaserequestlist.component.html',
  styleUrl: './purchaserequestlist.component.css'
})
export class PurchaserequestlistComponent {
  recordsPerPage: number = 6;
  searchText: string = '';
  medicines: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  searchTerm: string = '';
  filterStatus: string = 'Submitted';
  selectedStatus: string = 'Submitted';

  // ✅ Updated date filter properties
  activeFilter = 'today'; // Default to today
  startDate: string = '';
  endDate: string = '';

  requisitions: any[] = [];
  allRequisitions: any[] = [];

  constructor(
    private materialreqservice: MaterialrequestService,
    private router: Router,
    private userservice: RoleService
  ) {}

  userPermissions: any = {};
  userMaterialreApproval: any = {};
  module: string = '';

  ngOnInit(): void {
    // Permissions
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

    const materialreqModule = allPermissions.find((perm: any) => perm.moduleName === 'materialRequestList');
    const materialreqApproval = allPermissions.find((perm: any) => perm.moduleName === 'materialRequestApproval');

    this.userPermissions = materialreqModule?.permissions || {};
    this.userMaterialreApproval = materialreqApproval?.permissions || {};
    this.module = materialreqModule?.moduleName || materialreqApproval?.moduleName;

    this.filterStatus = this.selectedStatus;

    // ✅ Set today's date by default and load data
    this.setTodayFilter();
    this.loadmaterialrequest();
  }

  // ✅ Set today's date filter
  setTodayFilter(): void {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    this.startDate = today;
    this.endDate = today;
  }

  // ✅ Updated loadmaterialrequest method
  loadmaterialrequest() {
    let dateStart: string | undefined;
    let dateEnd: string | undefined;

    // Determine date range based on active filter
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      dateStart = today;
      dateEnd = today;
    } else if (this.activeFilter === 'dateRange' && this.startDate && this.endDate) {
      dateStart = this.startDate;
      dateEnd = this.endDate;
    }

    this.materialreqservice
      .getmaterialrequest(
        this.currentPage,
        this.recordsPerPage,
        this.searchTerm,
        this.filterStatus,
        dateStart,
        dateEnd
      )
      .subscribe(res => {
        this.allRequisitions = res.data || [];
        this.requisitions = res.data;
        this.totalPages = res.totalPages;
        this.currentPage = res.page;

        // User population logic
        this.requisitions.forEach(req => {
          if (req.createdBy) {
            this.userservice.getuserByIds(req.createdBy).subscribe(userRes => {
              req.createdByUser = userRes;
            });
          }
          if (req.approvedBy) {
            this.userservice.getuserByIds(req.approvedBy).subscribe(userRes => {
              req.approvedByUser = userRes;
            });
          }
        });
      });
  }

  // ✅ Updated applyFilters method
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadmaterialrequest(); // Load data from server with filters
  }

  onTabClick(status: string, index: number): void {
    this.selectedStatus = status;
    this.filterStatus = status;
    this.currentPage = 1;
    this.activeTabIndex = index;
    this.loadmaterialrequest();
  }

  statuses = ['Submitted', 'Approved', 'Rejected'];
  activeTabIndex = 0;

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadmaterialrequest();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadmaterialrequest();
    }
  }

  // ... rest of your existing methods (approve, reject, editrequest, deleterequest)
  approve(prId: string) {
    const auth = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userId = auth._id;

    const payload = {
      status: 'Approved',
      approvedBy: userId
    };

    this.materialreqservice.updatematerialstatusrequest(prId, payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Sent!',
          text: 'Material Request case has been approved & send for Purchase Intend successfully.',
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

        const target = this.requisitions.find(req => req._id === prId);
        if (target) {
          target.status = res.status;
          target.approvedBy = res.approvedBy;
        }

        this.requisitions.forEach(req => {
          if (req.approvedBy) {
            this.userservice.getuserByIds(req.approvedBy).subscribe(userRes => {
              req.approvedByUser = userRes;
            });
          }
        });

        this.router.navigateByUrl('inventorylayout/purchaseindent')
      },
      error: (err) => console.error('Failed to approve:', err)
    });
  }

  reject(prId: string) {
    const auth = JSON.parse(localStorage.getItem('authUser') || '{}');
    const userId = auth._id;

    const payload = {
      status: 'Rejected',
      approvedBy: userId
    };

    this.materialreqservice.updatematerialstatusrequest(prId, payload).subscribe({
      next: (res) => {
        const target = this.requisitions.find(req => req._id === prId);
        if (target) {
          target.status = res.status;
          target.approvedBy = res.approvedBy;
        }
      },
      error: (err) => console.error('Failed to reject:', err)
    });
  }

  editrequest(reqid: string) {
    this.router.navigate(['/inventorylayout/purchaserequest'], {
      queryParams: { _id: reqid },
    });
  }

  deleterequest(opdcaseid: string) {
    if (!opdcaseid) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Material Request case will be permanently deleted.',
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
        this.materialreqservice.deletematerialrequest(opdcaseid).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Material Request case has been deleted successfully.',
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

            this.requisitions = this.requisitions.filter(
              (symp: any) => symp._id !== opdcaseid
            );
          },
          error: (err) => {
            console.error('Error deleting material req case:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: err?.error?.message || 'There was an error deleting the OPD case.',
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
