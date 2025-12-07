import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CustomtimepickerComponent } from '../../component/customtimepicker/customtimepicker.component';
import { CustomcalendarComponent } from '../../component/customcalendar/customcalendar.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
  FormArray,
  Validators,
} from '@angular/forms';
// import Swal from 'sweetalert2';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { IpdService } from '../../views/ipdmodule/ipdservice/ipd.service';
import { DoctorService } from '../../views/doctormodule/doctorservice/doctor.service';
import { debounceTime, filter, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TestService } from '../testservice/test.service';
@Component({
  selector: 'app-pathointermbill',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './pathointermbill.component.html',
  styleUrl: './pathointermbill.component.css',
})
export class PathointermbillComponent {
  pathoareq: any[] = [];
  pathoinward: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  selectedPatient: any = null;
  selectedPatientDetails: any = null;
  selectedPackages: any[] = [];
  filteredPathoreq: any[] = [];
  uniqueHealthIdentificationId: string = '';
  constructor(
    private masterService: MasterService,
    private router: Router,
    private fb: FormBuilder,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private testservice: TestService,
    private cdr: ChangeDetectorRef
  ) // private multideptservice : PharmaService
  {
    this.pathoinward = this.fb.group({
      uhid: [''],
      admittingDoctorId: [''],
      dueAmount: [0],
      PaymentMode: ['', Validators.required],
      amountReceived: [0],
      total: [0],
      uniqueHealthIdentificationId: [''],
      inpatientDepartmentId: [''],
      patient_name: [''],
      age: [''],
      inwardSerialNumber: ['4654654'],
      status: [''],
      pathoUserId: ['6651579e3834d2aaf4a94620'],
      remarks: [''],
      typeOfRequest: ['pathology'], // assuming always pathology here
      testParameters: this.fb.array([]),
      requestedDepartmentId: [''],
      transactionId: [''],
      type: ['outpatientDepartment'],
    });
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inward'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    this.loadPathoreq();

    // this.pathoinward.get('patient_name')?.valueChanges.pipe(
    //   debounceTime(3000),
    //   switchMap((name: string) => {
    //     if (this.manuallySelected) return of({ uhids: [] });
    //     return name && name.length > 2
    //       ? this.doctorservice.getPatientByNamedeptreq(name)
    //       : of({ res: [] });
    //   })
    // ).subscribe((res: any) => {
    //   if (this.manuallySelected) return;
    //   console.log('API response:', res);
    //   this.pathoareq = res.data;
    //   this.showSuggestions = this.filteredPathoreq.length > 0;
    // });

    this.pathoinward
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        filter(() => !this.manuallySelected), // ✅ prevent API call after dropdown select
        switchMap((name: string) => {
          return name && name.length > 2
            ? this.doctorservice.getPatientByNamedeptreq(name)
            : of({ res: [] });
        })
      )
      .subscribe((res: any) => {
        console.log('API response:', res);
        this.pathoareq = res.data;
        this.showSuggestions = this.filteredPathoreq.length > 0;
      });

    this.pathoinward
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(3000),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return name && name.length > 2
            ? this.doctorservice.getPatientByUhiddeptreq(name)
            : of({ res: [] });
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        console.log('API response:', res);
        this.pathoareq = res.data;
        this.showSuggestions = this.filteredPathoreq.length > 0;
      });

    this.masterService.getMedicaltest().subscribe((res) => {
      // console.log("🚀 ~ ManageinwardComponent ~ this.masterService.getMedicaltest ~ res:", res)
    });

    // amount check
    this.pathoinward.get('total')?.valueChanges.subscribe(() => {
      this.updateDueAmount();
    });

    this.pathoinward.get('amountReceived')?.valueChanges.subscribe(() => {
      this.updateDueAmount();
    });

    // payement mode opt
    this.pathoinward.get('PaymentMode')?.valueChanges.subscribe((value) => {
      const txnControl = this.pathoinward.get('transactionId');
      if (value === 'upi') {
        txnControl?.setValidators([Validators.required]);
      } else {
        txnControl?.clearValidators();
        txnControl?.setValue('');
      }
      txnControl?.updateValueAndValidity();
    });
  }

  updateDueAmount() {
    const total = this.pathoinward.get('total')?.value || 0;
    const amountReceived = this.pathoinward.get('amountReceived')?.value || 0;
    const dueAmount = total - amountReceived;

    this.pathoinward
      .get('dueAmount')
      ?.setValue(dueAmount, { emitEvent: false });
  }

  loadPathoreq() {
    this.doctorservice.getreuesttestapis().subscribe({
      next: (res: any) => {
        const pathologyRequests: any[] = [];

        // Check if res.data is an array
        if (res && Array.isArray(res.data)) {
          res.data.forEach((patient: any) => {
            // Check departmentreqlists is an array
            if (Array.isArray(patient.departmentreqlists)) {
              patient.departmentreqlists.forEach((req: any) => {
                const hasPendingTest =
                  Array.isArray(req.testGroup) &&
                  req.testGroup.some(
                    (group: any) => group?.status?.toLowerCase() === 'pending'
                  );

                // Filter for pathology requests with pending tests
                if (
                  req.typeOfRequest === 'pathology' &&
                  hasPendingTest &&
                  req.type === 'outpatientDepartment'
                ) {
                  pathologyRequests.push({
                    patientId: patient._id,
                    patientName: patient.patient_name || patient.patientName,
                    uhid: patient.uhid,
                    gender: patient.gender,
                    age: patient.age,
                    mobile: patient.mobile_no,
                    area: patient.area,
                    requestDetails: req,
                    requestedDepartmentId: req._id,
                  });
                }
              });
            }
          });
        } else {
          // console.warn('Response data is not an array:', res);
        }

        this.filteredPathoreq = pathologyRequests;
        console.log('✅ Filtered Pathology Requests:', this.filteredPathoreq);
      },
      error: (err) => {
        console.error('❌ Failed to load pathology requests:', err);
        this.filteredPathoreq = [];
      },
    });
  }

  //     selectPatient(patient: any): void {
  //   this.manuallySelected = true;
  //   this.selectedPatient = patient;
  //   this.selectedPatientDetails = patient;
  //   this.showSuggestions = false;

  //   // Get the FIRST pharmaceutical request with status 'pending'
  //   const pendingRequest = patient.pharmaceuticalrequestlists?.find((req: any) => req.status === 'pending');

  //   if (!pendingRequest) {
  //     console.warn('No pending pharmaceutical request found for this patient.');
  //     return;
  //   }

  //   this.selectedPackages = pendingRequest.packages || [];

  //   // Clear previous FormArray data

  // this.uniqueHealthIdentificationId =  pendingRequest?.uniqueHealthIdentificationId

  //   // this.pathoinward.patchValue({
  //   //   age: patient?.age,
  //   //   uhid: patient?.uhid,
  //   //   admittingDoctorId: pendingRequest?.inpatientCaseDetails?.admittingDoctor?.name || '',
  //   //   uniqueHealthIdentificationId: pendingRequest?.uniqueHealthIdentificationId || '',
  //   //   inpatientDepartmentId: patient?.patientId,
  //   //   status: pendingRequest?.status || 'pending',
  //   //   pharmaceuticalRequestId: pendingRequest?._id
  //   // });

  //   this.pathoinward.patchValue({
  //   patient_name: patient?.patient_name, // ✅ Add this line
  //   age: patient?.age,
  //   uhid: patient?.uhid,
  //   admittingDoctorId: pendingRequest?.inpatientCaseDetails?.admittingDoctor?.name || '',
  //   uniqueHealthIdentificationId: pendingRequest?.uniqueHealthIdentificationId || '',
  //   inpatientDepartmentId: patient?.patientId,
  //   status: pendingRequest?.status || 'pending',
  //   pharmaceuticalRequestId: pendingRequest?._id
  // });

  //   // console.log("🚀 ~ ManageinwardComponent ~ selectPatient ~ inpatientDepartmentId:", inpatientDepartmentId)

  // // console.log('🔍 Patient:', patient);
  // // console.log('🔍 Pending Request:', pendingRequest);

  //   if (!patient || !patient.pharmaceuticalrequestlists) {
  //     return; // Safeguard: skip if data is not available
  //   }

  //   if (!pendingRequest) {
  //     return; // No pending request, no need to calculate
  //   }

  //   // Get the matching FormArray for the pending request (if separate per request)

  //   let total = 0;

  //   this.pathoinward.get('total')?.setValue(total);

  // }

  // selectPatient(patient: any): void {
  //   this.manuallySelected = true;
  //   this.selectedPatient = patient;
  //   this.selectedPatientDetails = patient;
  //   this.showSuggestions = false;

  //   const pendingRequest = patient.pharmaceuticalrequestlists?.find((req: any) => req.status === 'pending');
  //   if (!pendingRequest) return;

  //   this.selectedPackages = pendingRequest.packages || [];

  //   this.pathoinward.patchValue({
  //     patient_name: patient?.patient_name, // ✅ This is good
  //     age: patient?.age,
  //     uhid: patient?.uhid,
  //     admittingDoctorId: pendingRequest?.inpatientCaseDetails?.admittingDoctor?.name || '',
  //     uniqueHealthIdentificationId: pendingRequest?.uniqueHealthIdentificationId || '',
  //     inpatientDepartmentId: patient?.patientId,
  //     status: pendingRequest?.status || 'pending',
  //     pharmaceuticalRequestId: pendingRequest?._id
  //   }, { emitEvent: false }); // ✅ Prevent triggering valueChanges again!

  //   this.pathoinward.get('total')?.setValue(0);
  // }

  selectPatient(patient: any): void {
    this.manuallySelected = true;
    this.selectedPatient = patient;
    this.selectedPatientDetails = patient;
    this.showSuggestions = false;

    // ✅ GET departmentreqlists with typeOfRequest = pathology & status = pending
    const pendingRequest = patient.departmentreqlists?.find(
      (req: any) =>
        req.typeOfRequest === 'pathology' &&
        req.testGroup?.some((g: any) => g.status?.toLowerCase() === 'pending')
    );

    if (!pendingRequest) {
      console.warn('❌ No pending pathology request found.');
      return;
    }

    const firstTestGroup = pendingRequest.testGroup?.[0];

    this.pathoinward
      .get('patient_name')
      ?.setValue(patient.patient_name || patient.patientName || '');

    this.pathoinward.patchValue(
      {
        age: patient.age,
        uhid: patient.uhid,
        uniqueHealthIdentificationId:
          pendingRequest.uniqueHealthIdentificationId || '',
        inpatientDepartmentId: patient._id, // assuming this is patientId
        admittingDoctorId:
          pendingRequest?.inpatientCaseDetails?.admittingDoctor?.name || '',
        status: 'pending',
        requestedDepartmentId: pendingRequest._id,
        total: firstTestGroup?.price || 0,
      },
      { emitEvent: false }
    );

    // ✅ set selected test group data
    this.selectedTestGroupName = firstTestGroup?.testGroup || '';
    this.selectedTestParameters = firstTestGroup?.testParameters || [];
    this.selectedDepartmentRequestId = pendingRequest._id;

    this.cdr.detectChanges();
  }

  // onPatientInput() {
  //   const searchTerm = this.pathoinward.get('patient_name')?.value;

  //   if (this.manuallySelected && (!searchTerm || searchTerm.length > 2)) {
  //     this.manuallySelected = false;
  //     this.selectedPatientDetails = null;
  //   }

  //   if (!searchTerm || searchTerm.length >  2) {
  //     this.pathoareq = [];
  //     this.showSuggestions = false;
  //     return;
  //   }

  //   if (this.pathoareq.length > 0) {
  //     this.showSuggestions = true;
  //   }
  // }

  onPatientInput() {
    const searchTerm = this.pathoinward.get('patient_name')?.value?.trim();

    if (
      this.manuallySelected &&
      this.selectedPatientDetails?.patient_name === searchTerm
    ) {
      // ✅ suppress changes caused by manual patching
      this.manuallySelected = false;
      return;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.manuallySelected = false;
      this.selectedPatientDetails = null;
      this.pathoareq = [];
      this.showSuggestions = false;
      // return;
    } else if (!this.manuallySelected && this.pathoareq.length > 0) {
      this.showSuggestions = true;
    }

    // show dropdown only if you already have data
    // if (this.pathoareq.length > 0) {
    //   this.showSuggestions = true;
    // }
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectedDepartmentRequestId: string = '';
  selectedRequestId: string = '';
  // ROW PATCHUP

  selectedTestGroupName: string = '';
  selectedTestGroupStatus: string = 'pending';
  selectedTestParameters: any[] = [];

  onRowSelect(item: any): void {
    this.manuallySelected = true;

    this.pathoinward.patchValue({
      age: item.age,
      uhid: item.uhid,
      patient_name: item.patientName,
      uniqueHealthIdentificationId:
        item.requestDetails?.uniqueHealthIdentificationId || '',
      inpatientDepartmentId: item?.patientId,
      admittingDoctorId:
        item.requestDetails?.inpatientCaseDetails?.admittingDoctor?.name || '',
      requestedDepartmentId: item?.requestDetails?._id,
    });

    // ✅ Store department request ID
    this.selectedDepartmentRequestId = item.requestDetails?._id || '';
    console.log(
      '🚀 ~ ManageinwardComponent ~ onRowSelect ~  this.selectedDepartmentRequestId:',
      this.selectedDepartmentRequestId
    );
    //  this.selectedRequestId = selectedRow.requestId;

    const testGroup = item.requestDetails?.testGroup?.[0];
    if (!testGroup) return;

    this.selectedTestGroupName = testGroup.testGroup?.trim();
    this.selectedTestGroupStatus = testGroup.status;
    this.selectedTestParameters = testGroup.testParameters || [];

    this.pathoinward.patchValue({
      total: testGroup.price || 0,
    });
  }

async  onSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.pathoinward.invalid) {
      this.pathoinward.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    const formValues = this.pathoinward.value;

    const testParamsPayload = this.selectedTestParameters.map((param: any) => ({
      test_name: param.test_name,
      input: param.input || null,
      units: param.units,
      min: param.min,
      max: param.max,
    }));

    const payload = {
      uniqueHealthIdentificationId: formValues.uniqueHealthIdentificationId,
      // inpatientDepartmentId: formValues.inpatientDepartmentId,
      requestedDepartment: formValues.typeOfRequest,
      requestedDepartmentId: this.selectedDepartmentRequestId,
      type: formValues.type,
      testMaster: [
        {
          testGroup: this.selectedTestGroupName,
          testParameters: testParamsPayload,
          price: formValues.total || 1000,
          status: 'completed',
        },
      ],
      remarks: formValues.remarks,
      initials: '664b72cbbfc8a2b6f4c2b456',
      dueAmount: formValues.dueAmount,
      PaymentMode: formValues.PaymentMode,
      amountReceived: formValues.amountReceived,
      pharmaceuticalRequestId: formValues.pathoUserId,
      total: formValues.total,
    };
    console.log("🚀 ~ PathointermbillComponent ~ onSubmit ~ payload:", payload)

    this.testservice.postTestreq(payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Test Submitted',
          text: 'Pathology test submitted successfully.',
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

        // ✅ Update test group status
        const fullTestGroup = { ...payload.testMaster[0], status: 'completed' };
        const updatePayload = { testGroup: fullTestGroup };

        this.doctorservice
          .updatereuesttestapis(this.selectedDepartmentRequestId, updatePayload)
          .subscribe({
            next: () => {
              console.log('✅ Test group status updated.');
            },
            error: (err) => {
              console.error('❌ Error updating test group:', err);
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update test group status.',
                customClass: {
                  popup: 'hospital-swal-popup',
                  title: 'hospital-swal-title',
                  htmlContainer: 'hospital-swal-text',
                  confirmButton: 'hospital-swal-button',
                },
              });
            },
          });

        this.pathoinward.reset();
        this.router.navigateByUrl('/pathologylayout/opdpathologylayout');
      },
      error: (err) => {
        console.error('❌ Error submitting test:', err);
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text:
            err?.error?.message ||
            'Something went wrong while submitting the test.',
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

  // pagiantion

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  get paginatedPharmareq(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPathoreq.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
