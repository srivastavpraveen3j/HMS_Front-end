import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctorreferralrulelist',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './doctorreferralrulelist.component.html',
  styleUrl: './doctorreferralrulelist.component.css',
})
export class DoctorreferralrulelistComponent {
  referralForm!: FormGroup;
  currentPage = 1;
  totalPages = 1;
  allRules: any[] = [];
  userPermissions: any = {};

  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // Load permissions from localStorage
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const serviceModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'referralRule'
    );
    this.userPermissions = serviceModule?.permissions || {};

    // Initialize form
    this.referralForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    // Watch for changes in recordsPerPage
    this.referralForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadRules();
    });

    // Watch for searchText changes
    this.referralForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRules();
      });

    // Initial load
    this.loadRules();
  }

  loadRules() {
    const limit = this.referralForm.get('recordsPerPage')?.value || 10;
    const search = this.referralForm.get('searchText')?.value || '';

    this.masterService
      .getReferralRules(this.currentPage, limit, search)
      .subscribe((res) => {
        // console.log(res);
        this.allRules = res.rules || res.data || [];
        this.totalPages = res.totalPages || 1;
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRules();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRules();
    }
  }

  editservice(ruleId: string) {
    this.router.navigate(['/master/doctorreferralrule'], {
      queryParams: { _id: ruleId },
    });
  }

  async deleteservice(ruleId: string){
    const Swal = (await import('sweetalert2')).default;
    if (!ruleId) {
      console.error('Service ID is required for deletion');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'This service will be permanently deleted.',
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
        this.masterService.deleteService(ruleId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Service has been deleted successfully.',
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
            this.loadRules();
          },
          error: (err) => {
            console.error('Error deleting service:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error deleting the service.',
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
