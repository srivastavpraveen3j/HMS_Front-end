import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, of, switchMap } from 'rxjs';
import { IpdService } from '../../ipdservice/ipd.service';
import Swal from 'sweetalert2';
import { UhidService } from '../../../uhid/service/uhid.service';

@Component({
  selector: 'app-ipddeposit',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ipddeposit.component.html',
  styleUrl: './ipddeposit.component.css',
})
export class IpddepositComponent {
  ipddepositform: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  selectedPatient: any[] = [];
  ipdid: string = '';
  user: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ipdservice: IpdService,
    private route: ActivatedRoute,
    private uhidService: UhidService
  ) {
    this.ipddepositform = this.fb.group({
      patient_name: ['', Validators.required],
      // billAmount: ['', [Validators.required, Validators.min(1)]],
      amountDeposited: ['', [Validators.required, Validators.min(1)]],
      depositorFullName: ['', Validators.required],
      uniqueHealthIdentificationId: [''],
      paymentMode: [''],
      transactionId: [''],
      uhid: [''],
      inpatientCaseId: [''],
      collectedBy: [''],
    });
  }

  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientDeposit'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    const userStr = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = userStr._id;


    // uhid
    this.loadTodaysUHID();
    this.route.queryParams.subscribe((params) => {
      const patientId = params['id'];
      this.ipdid = patientId;
      if (patientId) {
        this.createIPDbillByPatientId(patientId);
      }
    });

    this.ipddepositform
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ inpatientCases: [] }); // ✅ Fixed return
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByPatientName(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.data?.inpatientCases || [];
        // console.log("Filtered Patients:", this.filteredPatients);
      });

    // using ipd uhid

    this.ipddepositform
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ inpatientCases: [] }); // ✅ Fixed return
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByUhid(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.data?.inpatientCases || [];
        // console.log("Filtered Patients:", this.filteredPatients);
      });
    // using ipd uhid

    this.route.queryParams.subscribe((params) => {
      const ipdadmissionid = params['_id'];
      if (ipdadmissionid) {
        this.loadIpddeposit(ipdadmissionid);
      } else {
        console.log('ipd case  Id not found in query params.');
      }
    });

    // payment mode opt
    this.ipddepositform
      .get('paymentmethod')
      ?.valueChanges.subscribe((value) => {
        const txnControl = this.ipddepositform.get('transactionId');
        if (value === 'upi') {
          txnControl?.setValidators([Validators.required]);
        } else {
          txnControl?.clearValidators();
          txnControl?.setValue('');
        }
        txnControl?.updateValueAndValidity();
      });
  }

  // uhid fo toadys
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        console.log('FULL RESPONSE:', res);

        const allRecords = res.data.inpatientCases || [];

        this.uhidTodayRecords = allRecords.filter((record: any) => {
          // SAFER → compare admissionDate instead of createdAt
          const admissionDate = new Date(record.admissionDate)
            .toISOString()
            .split('T')[0];
          return admissionDate === today;
        });

        console.log("Today's UHID Records:", this.uhidTodayRecords);
      },
      (err) => {
        console.error("Error loading today's UHID:", err);
      }
    );
  }

  selectPatientFromUHID(record: any): void {
    console.log('Selected from UHID dropdown:', record);
    this.selectPatient(record.uniqueHealthIdentificationId);
    this.showUHIDDropdown = false;
  }

  loadIpddeposit(ipdadmissionid: string) {
    this.ipdservice.getIPDdepositById(ipdadmissionid).subscribe((res: any) => {
      console.log('ipd deposit', res);
      const ipddeposit = res.data || {};
      const uhidId = ipddeposit.uniqueHealthIdentificationId;
      this.ipdid = ipddeposit.inpatientCaseId;

      if (uhidId) {
        // First try from cached cases
        this.ipdservice.getIPDcase(1, 1000).subscribe((caseRes: any) => {
          const ipdcases = caseRes.inpatientCases || [];
          const matchedCase = ipdcases.find(
            (ipdcase: any) =>
              ipdcase.uniqueHealthIdentificationId &&
              ipdcase.uniqueHealthIdentificationId._id === uhidId
          );

          if (matchedCase) {
            const patientName =
              matchedCase.uniqueHealthIdentificationId.patient_name;
            const uhid = matchedCase.uniqueHealthIdentificationId.uhid;

            this.ipddepositform.patchValue({
              patient_name: patientName,
              uhid: uhid,
              amountDeposited: ipddeposit.amountDeposited,
              depositorFullName: ipddeposit.depositorFullName,
              uniqueHealthIdentificationId: uhidId,
              paymentMode: ipddeposit.paymentMode,
              inpatientCaseId: ipddeposit.inpatientCaseId,
              collectedBy: ipddeposit.collectedBy,
            });
          } else {
            // Fallback: fetch UHID directly by ID
            this.uhidService.getUhidById(uhidId).subscribe((uhidRes: any) => {
              const uhid = uhidRes;
              this.ipddepositform.patchValue({
                patient_name: uhid.patient_name || 'N/A',
                uhid: uhid.uhid || 'N/A',
                amountDeposited: ipddeposit.amountDeposited,
                depositorFullName: ipddeposit.depositorFullName,
                uniqueHealthIdentificationId: uhidId,
                paymentMode: ipddeposit.paymentMode,
                inpatientCaseId: ipddeposit.inpatientCaseId,
                collectedBy: ipddeposit.collectedBy,
              });
            });
          }
        });
      }
    });
  }

  suggestionClicked = false;

  selectedPatientDetails: any = null; // New variable to hold selected patient's info

  selectPatient(patient: any): void {
    this.suggestionClicked = true; // block blur
    this.manuallySelected = true;
    this.selectedPatient = patient;
    this.selectedPatientDetails = patient;

    this.ipddepositform.patchValue({
      patient_name: patient?.uniqueHealthIdentificationId?.patient_name,
      uniqueHealthIdentificationId:
        patient?.uniqueHealthIdentificationId?._id || '',
    });

    this.showSuggestions = false;
    this.filteredPatients = [];

    // Reset the flag shortly after
    setTimeout(() => (this.suggestionClicked = false), 0);
  }

  onPatientInput() {
    const searchTerm = this.ipddepositform.get('patient_name')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
      this.selectedPatientDetails = null; // ✅ Clear old data
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    if (this.filteredPatients.length > 0) {
      this.showSuggestions = true;
    }
  }

  onUhidInput() {
    const searchTerm = this.ipddepositform.get('uhid')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
      this.selectedPatientDetails = null;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    if (this.filteredPatients.length > 0) {
      this.showSuggestions = true;
    }
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      if (!this.suggestionClicked) {
        this.showSuggestions = false;
      }
    }, 150);
  }

  resetForm(): void {
    this.ipddepositform.reset({
      patient_name: '',
      amountDeposited: '',
      depositorFullName: '',
      uniqueHealthIdentificationId: [''],
      paymentMode: [''],
      transactionId: [''],
      uhid: [''],
    });
  }

  // Submit function to handle form submission
  onSubmit() {
    const depositId = this.route.snapshot.queryParams['_id'];
    // console.log("deposit id", depositId);

    if (this.ipddepositform.valid) {

      const payload = {
        ...this.ipddepositform.value,
        collectedBy: this.user
      }

      if (depositId) {
        this.ipdservice
          .updateipddepositapis(depositId, payload)
          .subscribe({
            next: () =>
              this.showSuccessToast(
                'IPD Deposit Updated',
                'IPD deposit has been updated successfully.'
              ),
            error: (err) =>
              this.showErrorToast('Update Failed', err?.error?.message),
          });

        console.log("payload", payload);
      } else {
        const response = this.ipdservice
          .postipddepositapis(payload)
          .subscribe({
            next: () =>
              this.showSuccessToast(
                'IPD Deposit Added',
                'New IPD deposit has been added successfully.'
              ),
            error: (err) =>
              this.showErrorToast('Creation Failed', err?.error?.message),
          });
      }
    } else {
      this.showWarningToast(
        'Incomplete Form',
        'Please fill in all required fields before submitting.'
      );
    }
  }

  showSuccessToast(title: string, text: string) {
    Swal.fire({
      icon: 'success',
      title,
      text,
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
    this.ipddepositform.reset();
    // this.router.navigateByUrl('/ipd/ipddepositlist');
    if (this.ipdid) {
      this.router.navigate(['/ipdpatientsummary'], {
        queryParams: { id: this.ipdid },
      });
    } else {
      this.router.navigate(['/patientsummary']);
    }
  }

  showErrorToast(title: string, message: string) {
    Swal.fire({
      icon: 'error',
      title,
      text: message || 'Something went wrong.',
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
  }

  showWarningToast(title: string, message: string) {
    Swal.fire({
      icon: 'warning',
      title,
      text: message,
      customClass: {
        popup: 'hospital-swal-popup',
        title: 'hospital-swal-title',
        htmlContainer: 'hospital-swal-text',
        confirmButton: 'hospital-swal-button',
      },
    });
  }

  // loadipddata
  createIPDbillByPatientId(patientId: string): void {
    console.log("id", patientId);
    this.ipdservice.getIPDcaseById(patientId).subscribe({
      next: (ipdcase: any) => {
        const uhidId = ipdcase.data.uniqueHealthIdentificationId._id;
        console.log(
          '🚀 ~ IpddepositComponent ~ this.ipdservice.getIPDcaseById ~ uhidId:',
          uhidId
        );
        // Fetch IPD details separately
        this.uhidService.getUhidById(uhidId).subscribe({
          next: (uhid: any) => {
            console.log(
              '🚀 ~ OpdbillComponent ~ this.uhidService.getUhidById ~ uhid:',
              uhid
            );

            this.ipddepositform.patchValue({
              patient_name: uhid.patient_name || '',
              uniqueHealthIdentificationId: uhid,
              uhid: uhid.uhid,
              inpatientCaseId: patientId,
              // Add more fields if needed
            });
            this.manuallySelected = true; // prevent "no match" error
          },
          error: (err) => {
            console.error('Error fetching UHID:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error fetching IPD case:', err);
      },
    });
  }
}
