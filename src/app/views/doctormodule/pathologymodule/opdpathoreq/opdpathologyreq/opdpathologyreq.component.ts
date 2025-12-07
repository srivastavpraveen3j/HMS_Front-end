import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import Swal from 'sweetalert2';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { distinctUntilChanged } from 'rxjs/operators';
import { MasterService } from '../../../../mastermodule/masterservice/master.service';
import { IpdService } from '../../../../ipdmodule/ipdservice/ipd.service';
import { DoctorService } from '../../../doctorservice/doctor.service';
import { UhidService } from '../../../../uhid/service/uhid.service';
import { OpdService } from '../../../../opdmodule/opdservice/opd.service';

@Component({
  selector: 'app-opdpathologyreq',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './opdpathologyreq.component.html',
  styleUrl: './opdpathologyreq.component.css',
})
export class OpdpathologyreqComponent {
  pathoreq: FormGroup;
  medicaltest: any[] = [];
  doctors: any[] = [];
  // For Complete Lab Test
  selectedCompleteTests: any[] = [];
  dropdownOpenComplete = false;

  // For Assign Lab Test
  selectedAssignTests: any[] = [];
  dropdownOpenAssign = false;

  selectedPatientName: string = '';

  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;

  searchForm!: FormGroup;
  filteredTests: any[] = [];

  currentPage = 1;
  totalPages = 1;
  limit = 15;
  editMode = false;

  get searchTextControl(): FormControl {
    return this.searchForm.get('searchText') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private router: Router,
    private routes: ActivatedRoute,
    private uhidservice: UhidService,
    private opservice: OpdService,
    private route: ActivatedRoute
  ) {
    this.pathoreq = fb.group({
      uhid: ['', Validators.required],
      doa: [''],
      patient_name: ['', Validators.required],
      age: ['', Validators.required],
      gender: ['', Validators.required],
      // patient_type: ['', Validators.required],
      // admittingDoctorId: ['', Validators.required],
      diagnosisdetails: ['', Validators.required],
      labtestname: [''],
      notes: [''],
      bed_id: [''],
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      type: ['outpatientDepartment'],
      createdBy: [''],

      // medicaltest: this.fb.array([]),
    });
  }

  userId: string = '';
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  userPermissions: any = {};
  ngOnInit(): void {


    // rouet for lading

this.route.queryParams.subscribe((params) => {
  const patientid = params['patientId'];
  console.log("🚀 ~ OpdpathologyreqComponent ~ ngOnInit ~ patientid:", patientid);
  if (patientid) {
    this.loadOpdpathlogyreqByPatientId(patientid);
  }
});

    // rouet for lading
    // Load doctors and then allow patient selection
    this.masterService.getDoctors().subscribe((res) => {
      this.doctors = res?.data?.data || [];
    });
    // console.log(
    //   '🚀 ~ PathologyreqComponent ~ this.masterService.getDoctors ~ this.doctors:',
    //   this.doctors
    // );
    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'departmentRequestList'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // Load test groups
    this.searchForm = this.fb.group({
      searchText: [''],
    });

    this.searchForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchText) => {
        this.currentPage = 1;
        this.loadMedicaltestGroup();
      });

    this.loadMedicaltestGroup();

    const nameControl = this.pathoreq.get('patient_name');
    const uhidControl = this.pathoreq.get('uhid');
    // Patient input filter

    combineLatest([
      nameControl!.valueChanges.pipe(startWith('')),
      uhidControl!.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        debounceTime(300),
        switchMap(([patient_name, caseNo]) => {
          if (this.manuallySelected) return of({ uhids: [] });

          const filters: { [key: string]: string } = {};
          if (patient_name && patient_name.length > 2)
            filters['patient_name'] = patient_name;
          if (caseNo && caseNo.length > 2) filters['uhid'] = caseNo;

          return Object.keys(filters).length
            ? this.uhidservice.getPatientByFilters(filters)
            : of({ uhids: [] });
        })
      )
      .subscribe((response: any) => {
        if (!this.manuallySelected) {
          this.filteredPatients = response?.uhids || [];
          this.showSuggestions = this.filteredPatients.length > 0;
        }
      });

    // Edit mode
    this.routes.queryParams.subscribe((params) => {
      const testid = params['_id'];
      if (testid) {
        this.editMode = true;
        this.loadtest(testid);
      }
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

    // Reuse your existing patient select logic
    this.selectPatient(record);

    // Close dropdown
    this.showUHIDDropdown = false;
  }
  // loadtest(testid: string) {
  //   this.doctorservice.getreuesttestapis().subscribe({
  //     next: (res) => {
  //       console.log('Response', res);
  //       const pathologyRequests = res?.data.filter(
  //         (item: any) => item.typeOfRequest === 'pathology'
  //       );
  //       const pathologyData = pathologyRequests || [];
  //       const pathologyDatas = pathologyData.find((p: any) => p._id === testid);
  //       console.log('data', pathologyRequests);
  //       console.log('pathology', pathologyDatas);

  //       if (!pathologyDatas) return;

  //       // 🔁 Map medicalTest to expected format for selectedAssignTests
  //       this.selectedAssignTests = pathologyDatas.medicalTest.map(
  //         (test: any) => ({
  //           test_name: test.testName,
  //           _id: test._id, // Optional, in case needed for removing or matching
  //         })
  //       );

  //       // ✅ Patch rest of the form
  //       this.pathoreq.patchValue({
  //         uhid: pathologyDatas.uhid,
  //         patient_name: pathologyDatas.patientName,
  //         age: pathologyDatas.age,
  //         patient_type: pathologyDatas.patientType,
  //         admittingDoctorId: pathologyDatas?.admittingDoctorId?._id,
  //         bed_id: pathologyDatas.bed,
  //         diagnosisdetails: pathologyDatas.diagnosisDetails,
  //         uniqueHealthIdentificationId:
  //           pathologyDatas.uniqueHealthIdentificationId,
  //         inpatientCaseId: pathologyDatas._id,
  //         // Don't patch medicaltest here since it's UI-managed
  //       });
  //     },
  //   });
  // }

  loadtest(testid: string) {
    this.doctorservice.getreuesttestapis().subscribe({
      next: (res) => {
        const allPatients = res?.data ?? [];
        const pathologyDatas = allPatients;
        console.log(allPatients);

        let matchedTest: any = null;

        // 🔍 Loop over each patient, and check their departmentreqlists
        for (const patient of allPatients) {
          const deptRequests = Array.isArray(patient.departmentreqlists)
            ? patient.departmentreqlists
            : [];

          for (const req of deptRequests) {
            if (req._id === testid && req.typeOfRequest === 'pathology') {
              // 🧬 Merge parent and child data
              matchedTest = {
                ...req,
                age: patient.age,
                patient_name: patient.patient_name,
                uhid: patient.uhid,
                uniqueHealthIdentificationId: patient._id,
              };
              break;
            }
          }

          if (matchedTest) break;
        }

        if (!matchedTest) {
          console.warn('Test not found for ID:', testid);
          return;
        }

        // 🔁 Map medicalTest to expected format for selectedAssignTests
        if (Array.isArray(pathologyDatas.testGroup)) {
          this.selectedAssignTests = pathologyDatas.testGroup.map(
            (test: any) => ({
              test_name: test.testGroup,
              _id: test._id,
            })
          );
        } else {
          this.selectedAssignTests = []; // or handle error/empty case
        }

        // 🩺 Patch to form
        this.pathoreq.patchValue({
          uhid: matchedTest.uhid,
          patient_name: matchedTest.patient_name,
          age: matchedTest.age,
          patient_type: matchedTest.patientType,
          admittingDoctorId: matchedTest?.admittingDoctorId?._id,
          diagnosisdetails: matchedTest.diagnosisDetails,
          uniqueHealthIdentificationId:
            matchedTest.uniqueHealthIdentificationId,
          inpatientCaseId: matchedTest._id,
        });
      },
      error: (err) => {
        console.error('Failed to load test:', err);
      },
    });
  }

  selectedPatient: any = null;

  // on patient starts
  selectedDoctorName: string = '';
  selectPatient(patient: any): void {
    this.manuallySelected = true;
    this.selectedPatient = patient;

    this.pathoreq.patchValue({
      caseNo: patient.uhid || patient?.uniqueHealthIdentificationId?.uhid,
      patient_name:
        patient?.patient_name ||
        patient?.uniqueHealthIdentificationId?.patient_name,
      age: patient?.age || patient?.uniqueHealthIdentificationId?.age,
      gender: patient?.gender || patient?.uniqueHealthIdentificationId?.age,
      uniqueHealthIdentificationId:
        patient?.uniqueHealthIdentificationId?._id || patient?._id,
      uhid: patient?.uniqueHealthIdentificationId?.uhid || patient.uhid,
    });

    this.filteredPatients = [];
    this.showSuggestions = false;
  }

  onPatientInput(): void {
    const searchTerm = this.pathoreq.get('patient_name')?.value?.trim() || '';

    if (this.manuallySelected && searchTerm.length < 3) {
      this.manuallySelected = false;
      this.selectedPatient = null;
    }

    // No suggestions below 3 characters
    if (searchTerm.length < 3) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    // This flag will work *only if* filteredPatients is already populated
    this.showSuggestions = this.filteredPatients.length > 0;
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
  // on patient ends

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    // alert("I am in")
    if (this.pathoreq.invalid) {
      this.pathoreq.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Form Incomplete',
        text: 'Please fill all required fields before submitting.',
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
      return;
    }

    const formValue = this.pathoreq.value;

    const payload = {
      uniqueHealthIdentificationId: formValue.uniqueHealthIdentificationId,
      inpatientDepartmentId: formValue.inpatientCaseId,
      patientName: formValue.patient_name,
      age: formValue.age,
      bed: formValue.bed_id,
      uhid: formValue.uhid,
      dateOfAdmission: formValue.doa,
      dateOfRequest: new Date().toISOString(),
      timeOfRequest: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'outpatientDepartment',
      outpatientCaseId: null,
      patientType: formValue.patient_type,
      consultingDoctorId: formValue.admittingDoctorId,
      typeOfRequest: 'pathology',
      diagnosisDetails: formValue.diagnosisdetails,
      testGroup: this.selectedAssignTests.map((test) => ({
        testGroup: test.testGroup,
        testParameters: test.testParameters, // ✅ Send full array of objects
        description: test.description || '',
        price: test.price || 0,
        status: test.status || 'pending',
      })),
      createdBy: formValue.createdBy || this.userId,
    };

    console.log('🚀 ~ PathologyreqComponent ~ OnSubmit ~ payload:', payload);

    const testid = this.routes.snapshot.queryParams['_id'];

    if (testid) {
      // Update logic
      this.doctorservice.updatereuesttestapis(testid, payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'IPD Case Updated',
            text: 'Test Request has been updated successfully.',
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

          this.pathoreq.reset();
          this.router.navigate(['/doctor/pathologyreqlist']);
        },
        error: (err) => {
          console.error('Error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: 'Something went wrong while updating the Test Request case.',
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
      // Create new IPD case
      this.doctorservice.postreuesttestapis(payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Pathology Request Submitted',
            text: 'The request has been successfully sent.',
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

          this.pathoreq.reset();
          this.router.navigateByUrl('/doctor/opdpathologyreqlist');
          this.selectedAssignTests = []; // Reset selected tests if needed
        },
        error: (err) => {
          console.error('Error submitting pathology request:', err);
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'An error occurred while submitting the pathology request.',
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

  // For Complete Lab Test
  toggleDropdownComplete() {
    this.dropdownOpenComplete = !this.dropdownOpenComplete;
  }
  selectCompleteTest(test: any) {
    if (
      !this.selectedCompleteTests.find((t) => t.test_name === test.test_name)
    ) {
      this.selectedCompleteTests.push(test);
    }
  }
  removeCompleteTest(test: any) {
    this.selectedCompleteTests = this.selectedCompleteTests.filter(
      (t) => t.test_name !== test.test_name
    );
  }
  isCompleteSelected(test: any) {
    return this.selectedCompleteTests.some(
      (t) => t.test_name === test.test_name
    );
  }

  // For Assign Lab Test
  loadMedicaltestGroup(): void {
    const search = this.searchForm.get('searchText')?.value || '';
    this.masterService
      .getmedicaltestGroup(this.currentPage, this.limit, search)
      .subscribe((res) => {
        this.filteredTests = res.data || [];
        this.totalPages = res.totalPages;
        this.currentPage = res.page || this.currentPage;
      });
  }

  toggleDropdownAssign(): void {
    this.dropdownOpenAssign = !this.dropdownOpenAssign;
  }

  selectAssignTest(test: any): void {
    if (!this.selectedAssignTests.find((t) => t.testGroup === test.testGroup)) {
      this.selectedAssignTests.push(test);
    }
  }

  isAssignSelected(test: any): boolean {
    return this.selectedAssignTests.some((t) => t.testGroup === test.testGroup);
  }

  removeAssignTest(test: any): void {
    this.selectedAssignTests = this.selectedAssignTests.filter(
      (t) => t.testGroup !== test.testGroup
    );
  }

  hideDropdownWithDelay(): void {
    setTimeout(() => {
      this.dropdownOpenAssign = false;
    }, 200); // small delay to allow click
  }

  patient: any[] = [];
  loadOpdpathlogyreqByPatientId(patientid: string) {
    // console.log("🚀 ~ OpdpathologyreqComponent ~ loadOpdpathlogyreqByPatientId ~ patientid:", patientid)
    this.opservice.getOPDcaseById(patientid).subscribe({
      next: (opdcase: any) => {
        console.log('opdcase', opdcase);
        this.patient = opdcase;
        const uhidId = opdcase.uniqueHealthIdentificationId._id;

        // Fetch UHID details separately
        this.uhidservice.getUhidById(uhidId).subscribe({
          next: (uhid: any) => {
            // console.log("🚀 ~ OpdbillComponent ~ this.uhidService.getUhidById ~ uhid:", uhid)

            this.pathoreq.patchValue({
              uhid: uhid.uhid || '',
              patient_name: uhid.patient_name || '',
              age: uhid.age || '',
              gender: uhid.gender || '',
              uniqueHealthIdentificationId: uhid._id,
              patientUhidId: uhid._id,
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
        console.error('Error fetching OPD case:', err);
      },
    });
  }
}
