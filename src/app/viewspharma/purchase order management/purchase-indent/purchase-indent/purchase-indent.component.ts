import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RoleService } from '../../../../views/mastermodule/usermaster/service/role.service';
import { MaterialrequestService } from '../../purchaserequest/service/materialrequest.service';
import { PurchaseintendService } from '../service/purchaseintend.service';

@Component({
  selector: 'app-purchase-indent',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './purchase-indent.component.html',
  styleUrl: './purchase-indent.component.css',
})
export class PurchaseIndentComponent {
  purchaseintend: FormGroup;

  recordsPerPage: number = 100;
  searchText: string = '';
  medicines: any[] = [];
  filterForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  searchTerm: string = '';

  filterStatus: string = 'Approved'; // ✅ default
  selectedStatus: string = 'Approved'; // ✅ default

  requisitions: any[] = [];
  allRequisitions: any[] = [];

  userPermissions: any = {};
  userMaterialreApproval: any = {};

  // 🔎 Filter state
  filteredData: any[] = [];
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';

  statuses = ['Submitted', 'Approved', 'Rejected'];
  activeTabIndex = 0;

  selectedRequests: any[] = [];

  constructor(
    private materialreqservice: MaterialrequestService,
    private router: Router,
    private userservice: RoleService,
    private fb: FormBuilder,
    private purchaseintendservice: PurchaseintendService
  ) {
    this.purchaseintend = fb.group({});
  }
  module : string = '';

  ngOnInit(): void {
    // ✅ Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );

    const materialreqModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'materialRequestList'
    );
    const materialreqApproval = allPermissions.find(
      (perm: any) => perm.moduleName === 'materialRequestApproval'
    );

    this.userPermissions = materialreqModule?.permissions || {};
    this.userMaterialreApproval = materialreqApproval?.permissions || {};
       this.module           = this.userPermissions?.moduleName || 'purchaseIntend';

    this.filterStatus = this.selectedStatus;

    this.loadmaterialrequest();
  }

  loadmaterialrequest() {
    this.materialreqservice
      .getmaterialrequest(1, 1000, this.searchTerm, this.filterStatus)
      .subscribe((res) => {
        const data = res.data || [];

        // ✅ Only unintended (strict false) OR auto-lowstock
        this.allRequisitions = data.filter(
          (req: any) =>
            req.isIntended === false || req.requestType === 'auto-lowstock'
        );

        this.requisitions = this.allRequisitions;

        this.totalPages = 1;
        this.currentPage = 1;

        // Enrich with user info
        this.requisitions.forEach((req) => {
          if (req.createdBy) {
            this.userservice
              .getuserByIds(req.createdBy)
              .subscribe((userRes) => {
                req.createdByUser = userRes;
              });
          }
          if (req.approvedBy) {
            this.userservice
              .getuserByIds(req.approvedBy)
              .subscribe((userRes) => {
                req.approvedByUser = userRes;
              });
          }
        });
      });
  }

  applyFilters(): void {
    let baseList = [...this.allRequisitions];

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      baseList = baseList.filter((req) => {
        const createdAt = req?.createdAt || req?.created_at;
        return (
          createdAt && new Date(createdAt).toISOString().split('T')[0] === today
        );
      });
    } else if (this.activeFilter === 'dateRange') {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      baseList = baseList.filter((req) => {
        const createdAt = req?.createdAt || req?.created_at;
        const date = new Date(createdAt);
        return date >= start && date <= end;
      });
    }

    this.requisitions = baseList;
    console.log('📅 Filtered Requisitions (client-side):', baseList.length);
  }

  get filteredRequisitions() {
    return this.requisitions.filter(
      (req) => req.status === this.selectedStatus
    );
  }

  get filteredUnintendedRequisitions() {
    // ✅ Fix: only show when strictly false, not undefined
    return this.filteredRequisitions.filter(
      (r) => r.isIntended === false || r.requestType === 'auto-lowstock'
    );
  }

  onTabClick(status: string, index: number): void {
    this.selectedStatus = status;
    this.filterStatus = status;
    this.currentPage = 1;
    this.activeTabIndex = index;
    this.loadmaterialrequest();
  }

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

  toggleSelection(pr: any) {
    const index = this.selectedRequests.findIndex((req) => req._id === pr._id);
    if (index > -1) {
      this.selectedRequests.splice(index, 1);
    } else {
      this.selectedRequests.push(pr);
    }
  }

  isSelected(pr: any): boolean {
    return this.selectedRequests.some((req) => req._id === pr._id);
  }

  submitSelected() {
    if (this.selectedRequests.length === 0) return;

    const user = JSON.parse(localStorage.getItem('authUser') || '{}');

    const payload = {
      createdByUser: user._id,
      sourcePurchaseRequisitions: this.selectedRequests,
      status: 'pending',
    };

    // Step 1: Submit Purchase Indent
    this.purchaseintendservice.postmaterialrequest(payload).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Marked for Quotation!',
          text: 'Material Request case has been intended for Purchase & is pending for Quotation mark.',
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

        console.log('Purchase Indent Created:', response);

        // Step 2: Update each Material Request's isIntended to true
        this.selectedRequests.forEach((req) => {
          const updatePayload = { isIntended: true };
          this.materialreqservice
            .updatematerialrequest(req._id, updatePayload)
            .subscribe({
              next: () => {
                console.log(
                  `✅ Updated MRN ${req.materialRequestNumber} to isIntended: true`
                );
              },
              error: (err) => {
                console.error(
                  `❌ Failed to update MRN ${req.materialRequestNumber}`,
                  err
                );
              },
            });
        });

        // Step 3: Cleanup UI
        this.selectedRequests = [];
        this.purchaseintend.reset();
        this.filteredUnintendedRequisitions.forEach((pr) => (pr.hover = false));
        this.router.navigateByUrl('/inventorylayout/purchaseindentlist');
      },
      error: (err) => {
        console.error('Error submitting purchase indent:', err);
      },
    });
  }
}
