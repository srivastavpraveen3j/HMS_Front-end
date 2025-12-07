import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-doctorreferralrule',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './doctorreferralrule.component.html',
  styleUrl: './doctorreferralrule.component.css',
})
export class DoctorreferralruleComponent {
  referralform: FormGroup;
  ruleId: string | null = null;
  editMode: boolean = false;
  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;
  ServiceSearchControl = new FormControl('');
  filteredservcies: any[] = [];
  selectedServices: any[] = [];
  ServicePage = 1;
  Servcielimit = 10;
  user: string = '';

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.referralform = fb.group({
      department: ['', Validators.required],
      serviceName: [[], Validators.required],
      referralPercent: ['', Validators.required],
      capLimit: ['', Validators.required],
    });
  }

  userPermissions: any = {};
  showServiceList = false;
  selectedService: any = null; // to display selected

  hideDropdown() {
    setTimeout(() => (this.showServiceList = false), 200); // allow click event
  }

  ngOnInit() {
    // loadpermission

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'referralRule'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // loadpermission

    const userData = localStorage.getItem('authUser');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.user = user?.name || 'Unknown'; // Use optional chaining and fallback
      } catch (e) {
        console.error('Invalid JSON in authUser:', e);
        this.user = 'Unknown';
      }
    } else {
      this.user = 'Unknown'; // Handle case where authUser is missing
    }


    this.route.queryParams.subscribe((params) => {
      const ruleId = params['_id'];
      if (ruleId) {
        this.editMode = true;
        this.ruleId = ruleId;
        this.loadRules(ruleId);
      } else {
        console.log(
          '🚀 ~ ReferralRuleComponent ~ this.masterService.getReferralRule ~ Not Found'
        );
        this.editMode = false;
      }
    });

    this.ServiceSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query: string | null) => {
        if (query !== null) {
          this.serchService(query);
        } else {
          this.filteredservcies = [];
        }
      });
  }

  serchService(query: string) {
    const trimmedQuery = query.trim();
    this.masterService
      .getService(this.ServicePage, this.Servcielimit, trimmedQuery)
      .subscribe((res: any) => {
        this.filteredservcies = res.data || [];
      });
  }

  loadRules(ruleId: string) {
    this.masterService
      .getReferralRules(this.ServicePage, this.Servcielimit)
      .subscribe((res: any) => {
        const rules = res?.rules || res;
        const rule = rules.find((r: any) => r._id === ruleId);

        // console.log('Rule', rule);

        if (ruleId) {
          this.referralform.patchValue({
            department: rule.department,
            serviceName: rule.serviceName._id,
            referralPercent: rule.referralPercent,
            capLimit: rule.capLimit,
          });

          this.ServiceSearchControl.setValue(rule.serviceName?.name);
        } else {
          console.log(
            '🚀 ~ ReferralRuleComponent ~ this.masterService.getReferralRule ~ Not Found'
          );
        }
      });
  }

  // selectService(service: any) {
  //   if (!this.selectedServices.find((s) => s._id === service._id)) {
  //     this.selectedServices.push(service);
  //     this.updateServiceIdsInForm();
  //   }

  //   this.ServiceSearchControl.setValue('');
  //   this.filteredservcies = [];
  // }

  selectService(service: any) {
    this.referralform.get('serviceName')?.setValue(service._id);
    this.selectedService = service;
    this.ServiceSearchControl.setValue(service.name);
    this.showServiceList = false;
  }

  removeService(service: any) {
    this.selectedServices = this.selectedServices.filter(
      (s) => s._id !== service._id
    );
    this.updateServiceIdsInForm();
  }

  isServiceSelected(service: any) {
    return this.selectedServices.some((s) => s._id === service._id);
  }

  updateServiceIdsInForm() {
    this.referralform.patchValue({
      services: this.selectedServices.map((s) => s._id),
    });
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;
    if (this.referralform.invalid) {
      this.referralform.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.referralform.value,
      changedBy: this.user,
    };

    if (this.editMode && this.ruleId) {
      this.masterService.updateReferralRule(this.ruleId, formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Referral Rule Updated',
            text: 'Referral Rule updated successfully!',
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
          this.referralform.reset();
          this.router.navigateByUrl('/master/doctorreferralrulelist');
        },
        error: (error) => {
          console.error('Error updating referral rule:', error);
          let errorMessage = 'Failed to update referral rule.';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error?.error?.message || 'Referral Rule Update Failed',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    } else {
      this.masterService.postReferralRule(formData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Referral Rule Added',
            text: 'Referral Rule added successfully!',
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
          this.referralform.reset();
          this.router.navigateByUrl('/master/doctorreferralrulelist');
        },
        error: (error) => {
          console.error('Error adding referral rule:', error);
          let errorMessage = 'Failed to add Referral rule.';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: error?.error?.message || 'Referral Rule Creation Failed',
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
  }

  async onFileSelected(event: any){
    const Swal = (await import('sweetalert2')).default;
    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
    }
  }

  async uploadCSV(){
    const Swal = (await import('sweetalert2')).default;
    if (!this.selectedFile) {
      Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.masterService.uploadReferralRule(formData).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Referral Rule Updated',
          text: 'Bulk Upload of Referral Rule done successfully!',
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
        this.router.navigateByUrl('/master/doctorreferralrulelist');
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Bulk Upload error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: error?.error?.message || 'Referral Rule Bulk Upload Failed',
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
}
