import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
// import Swal from 'sweetalert2';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { DoctorService } from '../../doctorservice/doctor.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-pathologyreq',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pathologyreq.component.html',
  styleUrl: './pathologyreq.component.css',
})
export class PathologyreqComponent {
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
    private routes: ActivatedRoute
  ) {
    this.pathoreq = fb.group({
      uhid: ['', Validators.required],
      doa: [''],
      patient_name: ['', Validators.required],
      age: ['', Validators.required],
      patient_type: ['', Validators.required],
      admittingDoctorId: ['', Validators.required],
      diagnosisdetails: ['', Validators.required],
      labtestname: [''],
      notes: [''],
      bed_id: [''],
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      type: ['inpatientDepartment'],
      // medicaltest: this.fb.array([]),
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
    // Load doctors and then allow patient selection
    this.masterService.getDoctors().subscribe((res) => {
      this.doctors = res?.data?.data || [];
    });
    console.log(
      '🚀 ~ PathologyreqComponent ~ this.masterService.getDoctors ~ this.doctors:',
      this.doctors
    );
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

    // Patient input filter
    this.pathoreq
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByPatientName(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        this.filteredPatients = res?.data?.inpatientCases || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // uhdi patiet filkter
    // get details by patient uhid
    this.pathoreq
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByUhid(name)
            : of({ inpatientCases: [] });
        })
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        this.filteredPatients = res?.data?.inpatientCases || [];
        this.showSuggestions = this.filteredPatients.length > 0;
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
    this.selectPatient(record);
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
          bed_id: matchedTest.bed,
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

  // on patient starts
  selectedDoctorName: string = '';
  selectPatient(patient: any): void {
    this.manuallySelected = true;

    const formattedAdmissionDate = patient?.admissionDate
      ? new Date(patient.admissionDate).toISOString().split('T')[0]
      : '';

    const doctorId = patient?.admittingDoctorId?._id || '';
    const selectedDoctor = patient?.admittingDoctorId;

    // Limit the doctors array to only this doctor
    this.doctors = selectedDoctor ? [selectedDoctor] : [];

    this.pathoreq.patchValue({
      uhid: patient?.uniqueHealthIdentificationId?.uhid || '',
      patient_name: patient?.uniqueHealthIdentificationId?.patient_name || '',
      age: patient?.uniqueHealthIdentificationId?.age || '',
      gender: patient?.uniqueHealthIdentificationId?.gender || '',
      patientUhidId: patient?.uniqueHealthIdentificationId?._id || '',
      admissionDate: formattedAdmissionDate || '',
      bed_id: patient?.bed_id?.bed_number || '',
      admittingDoctorId: doctorId, // just the ID
      uniqueHealthIdentificationId: patient?.uniqueHealthIdentificationId,
      inpatientCaseId: patient._id || '',
      patient_type: patient.patient_type,
    });

    this.selectedPatientName =
      patient?.uniqueHealthIdentificationId?.patient_name || '';
    this.filteredPatients = [];
    this.showSuggestions = false;
  }

  onPatientInput() {
    if (this.editMode) {
      this.filteredPatients = [];
      return;
    }

    const searchTerm = this.pathoreq.get('patient_name')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    // 💡 Reset manuallySelected if the current input doesn't match selected patient
    if (
      this.manuallySelected &&
      searchTerm &&
      this.selectedPatientName &&
      searchTerm.toLowerCase() !== this.selectedPatientName.toLowerCase()
    ) {
      this.manuallySelected = false;
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
      this.showSuggestions = false;
    }, 200);
  }

  resetForm(): void{
     this.pathoreq.reset({
       uhid: [''],
       doa: [''],
       patient_name: [''],
       age: [''],
       patient_type: [''],
       admittingDoctorId: [''],
       diagnosisdetails: [''],
       labtestname: [''],
       notes: [''],
       bed_id: [''],
       uniqueHealthIdentificationId: [''],
       inpatientCaseId: [''],
       type: [''],
     });
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
      uniqueHealthIdentificationId: formValue.uniqueHealthIdentificationId._id,
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
      type: 'inpatientDepartment',
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
      createdBy: localStorage.getItem('userId'),
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
          this.router.navigateByUrl('/doctor/pathologyreqlist');
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
  //
}
