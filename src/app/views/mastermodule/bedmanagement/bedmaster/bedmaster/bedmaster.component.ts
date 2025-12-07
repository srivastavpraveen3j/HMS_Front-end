import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BedwardroomService } from '../../bedservice/bedwardroom.service';
import Swal from 'sweetalert2';
import { BillingConfigComponent } from "../../../../../component/billing-config/billing-config.component";

@Component({
  selector: 'app-bedmaster',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule, BillingConfigComponent],
  templateUrl: './bedmaster.component.html',
  styleUrl: './bedmaster.component.css',
})
export class BedmasterComponent implements OnInit {
  bedForm: FormGroup;
  bedTypes: any[] = [];
  userPermissions: any = {};
  bedTypeSearch: string = '';
  bedTypePage = 1;
  bedTypeLimit = 50;

  constructor(
    private fb: FormBuilder,
    private bedwardroomservice: BedwardroomService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bedForm = this.createBedForm();
  }

  ngOnInit(): void {
    this.setup();
  }

  /** Setup the component's state and fetch required data */
  setup(): void {
    this.loadPermissions();
    this.route.queryParams.subscribe((params) => {
      const bedid = params['_id'];

      this.fetchBedTypes(() => {
        if (bedid) this.loadBed(bedid);
      });
    });
  }

  /** Creates and returns the bed form group */
  private createBedForm(): FormGroup {
    return this.fb.group({
      bed_number: [''],
      bed_type_id: [''],
      remarks: [''],
      is_occupied: [false],
      is_active: [true],
    });
  }

  /** Loads user permissions from local storage */
  private loadPermissions(): void {
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const bedModule = allPermissions.find((perm: any) => perm.moduleName === 'bed');
    this.userPermissions = bedModule?.permissions || {};
  }

  /** Fetches bed types from the API */
  private fetchBedTypes(callback?: () => void): void {
    this.bedwardroomservice.getbedtypes().subscribe((res) => {
      this.bedTypes = res.data.bedTypes || [];
      if (callback) callback();
    });
  }

  /** Search bed types with pagination & search */
  searchBedTypes(): void {
    this.bedwardroomservice
      .getbedtype(this.bedTypePage, this.bedTypeLimit, this.bedTypeSearch)
      .subscribe((res) => {
        this.bedTypes = res.data.bedTypes || [];
      });
  }

  /** Load bed by ID */
  private loadBed(bedid: string): void {
    this.bedwardroomservice.getBedById(bedid).subscribe((res: any) => {
      const bed = res?.data || null;
      if (bed) {
        this.bedForm.patchValue({
          bed_number: bed.bed_number,
          bed_type_id: bed.bed_type_id,
          is_occupied: bed.is_occupied,
          is_active: bed.is_active,
          price_per_day: bed.price_per_day,
          remarks: bed.remarks,
        });
      } else {
        console.log('Bed ID not found.');
      }
    });
  }

  /** Submit handler */
  onSubmit(): void {
    if (this.bedForm.invalid) {
      return this.showAlert('warning', 'Incomplete Form', 'Please fill in all required fields before submitting.');
    }

    const bedid = this.route.snapshot.queryParams['_id'];
    const action = bedid
      ? this.bedwardroomservice.updatebed(bedid, this.bedForm.value)
      : this.bedwardroomservice.postbed(this.bedForm.value);

    action.subscribe({
      next: (res) => {
        this.showToast(bedid ? 'Bed Updated' : 'Bed Created');
        this.bedForm.reset();
        this.router.navigateByUrl('/master/bedmasterlist');
      },
      error: (err) => {
        this.showAlert(
          'error',
          bedid ? 'Update Failed' : 'Creation Failed',
          err?.error?.message || 'Something went wrong while processing the bed.'
        );
      }
    });
  }

  /** SweetAlert: Toast success */
  private showToast(title: string): void {
    Swal.fire({
      icon: 'success',
      title: title,
      text: title === 'Bed Created'
        ? 'New bed has been added successfully.'
        : 'Bed information has been updated successfully.',
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
  }

  /** SweetAlert: Full popup alert */
  private showAlert(icon: any, title: string, text: string): void {
    Swal.fire({
      icon,
      title,
      text,
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button'
      }
    });
  }
}
