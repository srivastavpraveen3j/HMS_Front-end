import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PurchaseintendService } from '../../purchase-indent/service/purchaseintend.service';
import { RequestquotationService } from '../service/requestquotation.service';
import { VendorService } from '../../vendor management/service/vendor.service';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-request-for-quotation-component',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './request-for-quotation-component.component.html',
  styleUrl: './request-for-quotation-component.component.css'
})
export class RequestForQuotationComponentComponent implements OnInit  {
  rfqForm!: FormGroup;
  submitted = false;
  puchaseintendid: string = '';
  requisitions: any = { sourcePurchaseRequisitions: [] };
  vendors : any[] =[];
    dropdownOpen: boolean = false;
    selectedPermissions: any[] = [];
    vendorSearchTerm: string = '';



private searchSubject = new Subject<string>();



onSearchVendor(searchText: string) {
  this.dropdownOpen = true; // Force dropdown to be visible
  this.searchSubject.next(searchText);
}

  // vendors = [
  //   { id: '897456123654', name: 'MediSupplies Pvt Ltd', email: 'srivastavpraveen3j@gmail.com' },
  //   { id: '987456123654', name: 'SurgiCare Distributors', email: 'srivastavpraveen3j@gmail.com' },
  //   { id: '987456123654', name: 'General Lab Supplies', email: 'srivastavpraveen3j@gmail.com' }
  // ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private purchaseintendservice: PurchaseintendService,
    private route: ActivatedRoute,
    private requestquotationservice  : RequestquotationService,
    private vendorservice : VendorService
  ) {
     this.rfqForm = this.fb.group({
    vendor: [[]]
  });

  }

ngOnInit(): void {

  this.route.queryParams.subscribe((params) => {
    this.puchaseintendid = params['_id'];
    if (this.puchaseintendid) {
      this.loadpurhcaseintend(this.puchaseintendid);
    }
  });


  this.route.queryParams.subscribe((params) => {
    this.puchaseintendid = params['_id'];
    if (this.puchaseintendid) {
      this.loadpurhcaseintend(this.puchaseintendid);
    }
  });

  // 🔍 Debounced vendor search
  this.searchSubject.pipe(
    debounceTime(300), // Wait 300ms after typing stops
    distinctUntilChanged(),
    switchMap(searchText => this.vendorservice.getvendor(1, 25, searchText))
  ).subscribe(res => {
    this.vendors = res.data || [];
  });

  // Load initial vendor list
  this.vendorservice.getvendor().subscribe(res => {
    this.vendors = res.data || [];
  });
}



selectPermission(vendor: any) {
  const alreadySelected = this.selectedPermissions.find(p => p._id === vendor._id);
  if (!alreadySelected) {
    this.selectedPermissions.push(vendor);
    this.rfqForm.patchValue({
      vendor: this.selectedPermissions.map(p => p._id) // only send IDs to backend
    });

    // Clear the search input after selection
    this.vendorSearchTerm = '';
    this.dropdownOpen = false; // Optional: close dropdown after selection

    // Reload full vendor list after clearing search
    this.vendorservice.getvendor().subscribe(res => {
      this.vendors = res.data || [];
    });
  }
}

  removePermission(vendor: any) {
    this.selectedPermissions = this.selectedPermissions.filter(p => p._id !== vendor._id);
    this.rfqForm.patchValue({
      vendor: this.selectedPermissions.map(p => p._id)
    });
  }

 // Add this method to your component
onDropdownToggle(isOpen: boolean) {
  if (!isOpen) {
    // Clear search when dropdown closes
    this.vendorSearchTerm = '';

    // Reload full vendor list
    this.vendorservice.getvendor().subscribe(res => {
      this.vendors = res.data || [];
    });
  }
  this.dropdownOpen = isOpen;
}


  loadpurhcaseintend(purchaseid: string) {
    this.purchaseintendservice.getmaterialrequestById(purchaseid).subscribe((res) => {
      this.requisitions = res || { sourcePurchaseRequisitions: [] };
      console.log('🧾 Loaded Requisition:', this.requisitions);
    });
  }

submitRFQ() {
  this.submitted = true;

  if (this.rfqForm.invalid || !this.rfqForm.value.vendor?.length) {
    this.rfqForm.markAllAsTouched();

    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Form',
      text: 'Please select at least one vendor before submitting.',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button'
      }
    });
    return;
  }

  const sentToVendors = this.rfqForm.value.vendor; // array of ObjectId strings

  const payload = {
    sentToVendors,
    vendorDetails: [],  // optional
    items: this.requisitions?.sourcePurchaseRequisitions || [],
    status: 'open'
  };

  console.log('✅ RFQ Submission Payload:', payload);

  this.requestquotationservice.postrequestquotation(payload).subscribe({
    next: (res) => {
      console.log("✅ RFQ successfully posted:", res);

      const statusPayload = { status: 'processed' };
      this.purchaseintendservice.updatematerialrequest(this.puchaseintendid, statusPayload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'RFQ Created',
            text: 'Request for Quotation has been successfully submitted.',
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

          this.rfqForm.reset();
          this.router.navigateByUrl('/inventorylayout/requestquotationlist');
        },
        error: (updateErr) => {
          console.error("❌ Failed to update purchase intend status:", updateErr);

          Swal.fire({
            icon: 'error',
            title: 'Status Update Failed',
            text: 'RFQ was posted, but updating the purchase intend status failed.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button'
            }
          });
        }
      });
    },
    error: (err) => {
      console.error("❌ Failed to post RFQ:", err);

      Swal.fire({
        icon: 'error',
        title: 'RFQ Submission Failed',
        text: 'There was an error while submitting the RFQ. Please try again.',
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



  getSelectedVendorName(): string {
    const vendor = this.vendors.find(v => v.id === this.rfqForm.value.vendor);
    return vendor ? vendor.name : '';
  }

  clearSearch() {
  this.vendorSearchTerm = '';

  // Reload full vendor list
  this.vendorservice.getvendor().subscribe(res => {
    this.vendors = res.data || [];
  });
}
getSelectedVendorNames(): string {
  if (this.selectedPermissions.length === 0) return '';
  if (this.selectedPermissions.length === 1) return this.selectedPermissions[0].vendorName;
  if (this.selectedPermissions.length === 2) {
    return `${this.selectedPermissions[0].vendorName} and ${this.selectedPermissions[1].vendorName}`;
  }
  return `${this.selectedPermissions[0].vendorName} and ${this.selectedPermissions.length - 1} others`;
}

}
