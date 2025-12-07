import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { debounceTime, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { UhidService } from '../../../uhid/service/uhid.service';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { DoctorService } from '../../doctorservice/doctor.service';
import { combineLatest } from 'rxjs';
import { startWith, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-daignonsissheet',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './daignonsissheet.component.html',
  styleUrl: './daignonsissheet.component.css',
})
export class DaignonsissheetComponent {
  diagnosisheet: FormGroup;
  symptoms: any[] = [];
  filteredSymptoms: any[] = [];
  symptomRows: any[] = [];
  packages: any[] = [];
  medicines: any[] = [];
  selectedMedicines: any[] = [];
  dropdownOpenMedicines: boolean = false;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;

  // Multi-selection state for symptoms
  selectedSymptoms: any[] = [];
  private lastSelectedIndex: number = -1;
  searchForm!: FormGroup;
  symptomSearchTerm: string = '';

  packageData = {
    medicines: [],
  };
  showOutpatientPatientInput: boolean = false;
  showInpatientPatientInput: boolean = false;

  selectedPackage: any = null;
  symptomGroup: any[] = [];

  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];

  currentPage = 1;
  totalPages = 1;
  editMode: boolean = false;
  diagnosisId: string = '';
  user: string = '';

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private router: Router,
    private route: ActivatedRoute,
    private uhidService: UhidService
  ) {
    const now = new Date();

    this.diagnosisheet = this.fb.group({
      uniqueHealthIdentificationId: ['', Validators.required],
      inpatientCaseId: ['', Validators.required],
      bed_id: [''],
      patient_name: [''],
      uhid: [''],
      age: [''],
      gender: [''],
      type: ['inpatientDepartment'],

      dob: [''],
      area: [''],
      pincode: [''],
      mobile_no: [''],

      systolicBloodPressure: [''],
      diastolicBloodPressure: [''],
      bloodGroup: [''],
      temperature: [''],
      height: [''],
      weight: [''],
      pulseRate: [''],
      spo2: [''],
      bloodSugar: [''],

      name: [''],
      properties: [''],
      since: [''],
      remarks: [''],

      clinicalExamination: [''],
      diagnosis: [''],
      medicalHistory: [''],
      investigation: [''],

      quantity: [0],
      packages: this.fb.array([]),
      medicinesArray: this.fb.array([]),
      respiratoryRate: [0],

      nextFollowUpDate: [''],
      primaryDiagnosis: [''],
      extraDetails: [''],
      generalAdvice: [''],
      createdBy: [''],
    });

    // Initialize search form for symptoms
    this.searchForm = this.fb.group({
      searchText: [''],
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  userPermissions: any = {};

  ngOnInit(): void {
    // Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'diagnosisSheet'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // Route parameters
    this.route.queryParams.subscribe((params) => {
      const ipdid = params['_id'];
      const id = params['id'];
      if (ipdid) {
        this.caseDiagnosis(ipdid);
      } else if (id) {
        this.editMode = true;
        this.diagnosisId = id;
        this.updateDiagnosis(id);
      }
    });

    const userStr = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = userStr._id;

    // Symptoms search functionality
    this.searchForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.symptomSearchTerm = searchTerm || '';
        this.currentPage = 1;
        this.loadSymptoms();
      });

    // Load today's UHID
    this.loadTodaysUHID();

    // Patient name search
    this.diagnosisheet
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

    // UHID search
    this.diagnosisheet
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

    this.loadSymptoms();

    this.masterService.getAllSymptomsGroup().subscribe((res) => {
      this.symptomGroup = res.data;
    });

    this.masterService.getPackages().subscribe({
      next: (res) => {
        this.packages = res.pkg || [];
      },
      error: (err) => {
        console.error('Error fetching packages:', err);
      },
    });

    this.masterService.getMedicine().subscribe({
      next: (res) => {
        this.medicines = res.data || [];
      },
      error: (err) => {
        console.error('Error fetching medicines:', err);
      },
    });

    this.addMedicineRow();
  }

  loadSymptoms() {
    const search = this.searchForm.get('searchText')?.value || '';

    this.masterService
      .getSymptoms(this.currentPage, 10, search)
      .subscribe((res) => {
        this.symptoms = res.data;
        this.filteredSymptoms = [...this.symptoms];
        this.totalPages = res.totalPages;
        this.currentPage = res.page;
      });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSymptoms();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSymptoms();
    }
  }

  // Multi-select functionality with shift key support
  selectSymptom(event: MouseEvent, symptom: any, currentIndex: number): void {
    event.preventDefault();

    const isShiftPressed = event.shiftKey;
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    if (isShiftPressed && this.lastSelectedIndex !== -1) {
      // Shift-click: Select range
      this.selectRange(this.lastSelectedIndex, currentIndex);
    } else if (isCtrlPressed) {
      // Ctrl-click: Toggle individual selection
      this.toggleSymptomSelection(symptom);
      this.lastSelectedIndex = currentIndex;
    } else {
      // Regular click: Clear selection and select only this item
      this.selectedSymptoms = [symptom];
      this.lastSelectedIndex = currentIndex;
    }

    console.log(`Selected symptoms: ${this.selectedSymptoms.length}`);
  }

  // Select range of symptoms (for shift-click)
  private selectRange(startIndex: number, endIndex: number): void {
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    // Clear current selection
    this.selectedSymptoms = [];

    // Select items in range
    for (let i = minIndex; i <= maxIndex; i++) {
      if (i < this.filteredSymptoms.length) {
        const symptom = this.filteredSymptoms[i];
        if (!this.isSymptomSelected(symptom)) {
          this.selectedSymptoms.push(symptom);
        }
      }
    }
  }

  // Toggle individual symptom selection
  private toggleSymptomSelection(symptom: any): void {
    const index = this.selectedSymptoms.findIndex((s) => s._id === symptom._id);

    if (index > -1) {
      this.selectedSymptoms.splice(index, 1);
    } else {
      this.selectedSymptoms.push(symptom);
    }
  }

  // Check if symptom is selected
  isSymptomSelected(symptom: any): boolean {
    return this.selectedSymptoms.some((s) => s._id === symptom._id);
  }

  // Remove individual selected symptom
  removeSelectedSymptom(symptom: any): void {
    const index = this.selectedSymptoms.findIndex((s) => s._id === symptom._id);
    if (index > -1) {
      this.selectedSymptoms.splice(index, 1);
    }
  }

  // Clear all selections
  clearSymptomSelection(): void {
    this.selectedSymptoms = [];
    this.lastSelectedIndex = -1;
  }

  // Add selected symptoms to table
  addSelectedSymptomsToTable(): void {
    this.selectedSymptoms.forEach((symptom) => {
      this.addSymptomToTable(symptom);
    });
    this.clearSymptomSelection();
  }

  // Add single symptom to table
  addSymptomToTable(symptom: any): void {
    const exists = this.symptomRows.some(
      (row) => row.symptomName === symptom.name
    );
    if (!exists) {
      this.symptomRows.push({
        symptomName: symptom.name || '',
        properties: symptom.properties || '',
        since: '',
        remarks: symptom.remakks || '',
      });
    }
  }

  // Legacy method for backward compatibility
  addSymptom(symptom: any) {
    this.addSymptomToTable(symptom);
  }

  // Add blank row manually
  addNewRow() {
    this.symptomRows.push({
      symptomName: '',
      properties: '',
      since: '',
      remarks: '',
    });
  }

  // Remove row
  removeRow(index: number) {
    this.symptomRows.splice(index, 1);
  }

  // UHID for today's
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        console.log('FULL RESPONSE:', res);

        const allRecords = res.data.inpatientCases || [];

        this.uhidTodayRecords = allRecords.filter((record: any) => {
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

  caseDiagnosis(patientId: string): void {
    this.ipdservice.getIPDcaseById(patientId).subscribe({
      next: (ipdcase: any) => {
        console.log('IPD', ipdcase);
        const ipd = ipdcase.data;
        if (ipd) {
          this.selectPatient(ipd);
        } else {
          console.warn('No inpatient case found with the provided ID.');
        }
      },
      error: (err) => {
        console.error('Error fetching IPD case:', err);
      },
    });
  }

  updateDiagnosis(diagnosisId: string) {
    this.doctorservice.getDiagnosisbyID(diagnosisId).subscribe((res) => {
      console.log('diagnosis by id', res);
      const raw = res;

      this.diagnosisheet.patchValue({
        uhid: raw?.uniqueHealthIdentificationId?.uhid || '',
        patient_name: raw?.uniqueHealthIdentificationId?.patient_name || '',
        age: raw?.uniqueHealthIdentificationId?.age || '',
        gender: raw?.uniqueHealthIdentificationId?.gender || '',
        bed_id: raw.inpatientCaseId?.bed_id?.bed_number || '',
        admittingDoctorId: raw?.admittingDoctorId?._id || '',
        uniqueHealthIdentificationId:
          raw?.uniqueHealthIdentificationId ||
          raw.uniqueHealthIdentificationId?._id,
        inpatientCaseId: raw.inpatientCaseId._id || '',
        systolicBloodPressure: raw.vitals?.systolicBloodPressure,
        diastolicBloodPressure: raw.vitals?.diastolicBloodPressure,
        bloodGroup: raw.vitals?.bloodGroup,
        temperature: raw.vitals?.temperature,
        height: raw.vitals?.height,
        weight: raw.vitals?.weight,
        pulseRate: raw.vitals?.pulseRate,
        spo2: raw.vitals?.spo2,
        bloodSugar: raw.vitals?.bloodSugar,
        respiratoryRate: raw.vitals?.respiratoryRate,
        clinicalExamination: raw.clinicalExamination,
        investigation: raw.investigation,
        diagnosis: raw.diagnosis,
        medicalHistory: raw.medicalHistory,
        type: 'inpatientDepartment',
        createdBy: raw.createdBy,
      });

      this.manuallySelected = true;

      this.symptomRows = (raw.symptoms || []).map((symptom: any) => ({
        symptomName: symptom.name || '',
        properties: symptom.properties || '',
        since: symptom.since || '',
        remarks: symptom.remarks || '',
      }));
    });
  }

  selectPatientFromUHID(record: any): void {
    console.log('Selected from UHID dropdown:', record);
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }

  getCheckboxGroup(row: AbstractControl): FormGroup {
    return (
      (row.get('checkboxGroup') as FormGroup) ??
      this.fb.group({
        morning: false,
        noon: false,
        evening: false,
        night: false,
      })
    );
  }

  get medicinesArray(): FormArray {
    return this.diagnosisheet.get('medicinesArray') as FormArray;
  }

  createMedicineGroup(): FormGroup {
    return this.fb.group({
      medicine_name: [''],
      quantity: [0],
      charge: [''],
      checkbox: this.fb.group({
        morning: [false],
        noon: [false],
        evening: [false],
        night: [false],
      }),
    });
  }

  addMedicineRow() {
    const medicineGroup = this.fb.group({
      medicine_name: [''],
      quantity: [0],
      checkbox: this.fb.group({
        morning: [false],
        noon: [false],
        evening: [false],
        night: [false],
      }),
      charge: [''],
    });

    this.medicinesArray.push(medicineGroup);
  }

  get packageControl() {
    return this.diagnosisheet.get('package');
  }

  onPackageSelect(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    const pkg = this.packages.find((p) => p._id === selectedId);

    if (pkg) {
      this.selectedPackage = pkg;

      const packageFormArray = this.diagnosisheet.get('packages') as FormArray;
      packageFormArray.clear();

      pkg.medicines.forEach((med: any) => {
        packageFormArray.push(
          this.fb.group({
            medicineName: [med.medicine_name],
            charge: [med.price || 0],
            quantity: [0],
            checkbox: this.fb.group({
              morning: [med.checkbox?.morning || false],
              noon: [med.checkbox?.noon || false],
              evening: [med.checkbox?.evening || false],
              night: [med.checkbox?.night || false],
            }),
          })
        );
      });
    }
  }

  dropdownOpenSymptoms = false;

  toggleMedicineDropdown() {
    this.dropdownOpenMedicines = !this.dropdownOpenMedicines;
  }

  selectMedicine(medicine: any) {
    if (!this.isMedicineSelected(medicine)) {
      this.selectedMedicines.push(medicine);
      this.updateSelectedMedicines();
    }
  }

  removeMedicine(medicine: any) {
    this.selectedMedicines = this.selectedMedicines.filter(
      (m) => m._id !== medicine._id
    );
    this.updateSelectedMedicines();
  }

  updateSelectedMedicines() {
    const ids = this.selectedMedicines.map((m) => m._id);
    this.diagnosisheet.patchValue({ medicines: ids });
  }

  isMedicineSelected(medicine: any): boolean {
    return this.selectedMedicines.some((m) => m._id === medicine._id);
  }

  fetchPackages() {
    this.masterService.getPackages().subscribe((response: any) => {
      console.log('API Response for Packages:', response);
      this.packages = response.pkg;
      console.log('Packages Array:', this.packages);
    });
  }

  selectPatient(patient: any): void {
    console.log("patient from case", patient);
    this.manuallySelected = true;
    const formattedAdmissionDate = patient?.admissionDate
      ? new Date(patient.admissionDate).toISOString().split('T')[0]
      : '';
    this.diagnosisheet.patchValue({
      uhid: patient?.uniqueHealthIdentificationId?.uhid || '',
      patient_name: patient?.uniqueHealthIdentificationId?.patient_name || '',
      age: patient?.uniqueHealthIdentificationId?.age || '',
      gender: patient?.uniqueHealthIdentificationId?.gender || '',
      patientUhidId: patient?.uniqueHealthIdentificationId?._id || '',
      admissionDate: formattedAdmissionDate || '',
      bed_id: patient?.bed_id?.bed_number || '',
      admittingDoctorId: patient?.admittingDoctorId?._id || '',
      uniqueHealthIdentificationId: patient?.uniqueHealthIdentificationId,
      inpatientCaseId: patient._id || '',
      createdBy: patient.createdBy,
      bloodGroup: patient.vitals[0]?.bloodGroup,
      weight: patient.vitals[0]?.weight,
    });

    this.showSuggestions = false;
    this.filteredPatients = [];
  }

  onPatientInput() {
    const searchTerm = this.diagnosisheet.get('patient_name')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
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

  onUHIDInput() {
    const searchTerm = this.diagnosisheet.get('uhid')?.value;

    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
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

  buildFormattedDiagnosisData(): any {
    const raw = this.diagnosisheet.value;

    return {
      uniqueHealthIdentificationId:
        raw.uniqueHealthIdentificationId?._id ||
        raw.uniqueHealthIdentificationId,
      inpatientCaseId: raw.inpatientCaseId._id || raw.inpatientCaseId,
      vitals: {
        systolicBloodPressure: +raw.systolicBloodPressure,
        diastolicBloodPressure: +raw.diastolicBloodPressure,
        bloodGroup: raw.bloodGroup,
        temperature: +raw.temperature,
        height: +raw.height,
        weight: +raw.weight,
        pulseRate: +raw.pulseRate,
        spo2: +raw.spo2,
        bloodSugar: +raw.bloodSugar,
        respiratoryRate: +raw.respiratoryRate,
      },
      symptoms: this.symptomRows.map((sym) => ({
        name: sym.symptomName,
        properties: sym.properties,
        since: sym.since,
        remarks: sym.remarks,
      })),
      clinicalExamination: raw.clinicalExamination,
      investigation: raw.investigation,
      diagnosis: raw.diagnosis,
      medicalHistory: raw.medicalHistory,
      type: 'inpatientDepartment',
      packages: this.medicinesArray.controls.map((medCtrl: AbstractControl) => {
        const med = medCtrl.value;
        return {
          medicineName: med.medicine_name,
          quantity: med.quantity,
          charge: med.charge,
          checkbox: {
            morning: med.checkbox.morning,
            noon: med.checkbox.noon,
            evening: med.checkbox.evening,
            night: med.checkbox.night,
          },
        };
      }),

      nextFollowUpDate: raw.nextFollowUpDate,
      primaryDiagnosis: raw.primaryDiagnosis,
      extraDetails: raw.extraDetails,
      generalAdvice: raw.generalAdvice,
    };
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.diagnosisheet.invalid) {
      this.diagnosisheet.markAllAsTouched();
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

    const formattedData = this.buildFormattedDiagnosisData();
    const payload = {
      ...formattedData,
      createdBy: this.user,
    }

    if (this.editMode && this.diagnosisId) {
      this.doctorservice
        .updateDiagnosissheet(this.diagnosisId, payload)
        .subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Diagnosis Sheet updated',
              text: 'The diagnosis record has been updated successfully!',
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

            this.diagnosisheet.reset();
            if (res?.inpatientCaseId) {
              this.router.navigate(['/ipdpatientsummary'], {
                queryParams: { id: res?.inpatientCaseId },
              });
            } else {
              this.router.navigate(['/ipdpatientsummary']);
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Update Failed',
              text:
                err?.error?.message ||
                'An error occurred while updating the diagnosis sheet.',
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
      this.doctorservice.postDiagnosissheet(payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Diagnosis Sheet Created',
            text: 'The diagnosis record has been submitted successfully!',
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

          this.diagnosisheet.reset();
          if (res?.inpatientCaseId) {
            this.router.navigate(['/ipdpatientsummary'], {
              queryParams: { id: res?.inpatientCaseId },
            });
          } else {
            this.router.navigate(['/ipdpatientsummary']);
          }
        },
        error: (err) => {
          console.error('Error submitting diagnosis sheet:', err);
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text:
              err?.error?.message ||
              'An error occurred while submitting the diagnosis sheet.',
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

  // Search form getter
  get searchTextControl(): FormControl {
    return this.searchForm.get('searchText') as FormControl;
  }
}
