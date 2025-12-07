import { OpdService } from './../../opdservice/opd.service';
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
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { DoctorService } from '../../../doctormodule/doctorservice/doctor.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-diagnosis',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './diagnosis.component.html',
  styleUrl: './diagnosis.component.css',
})
export class DiagnosisComponent {
  medicineSearchControl = new FormControl('');
  filteredMedicines: any[] = [];
  searchForm!: FormGroup;

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
  opdcaseid: string = '';

  // ✅ Edit mode properties
  editMode: boolean = false;
  diagnosisId: string = '';

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private ipdservice: IpdService,
    private doctorservice: DoctorService,
    private router: Router,
    private uhidService: UhidService,
    private route: ActivatedRoute,
    private opdservice: OpdService,
    private toastr: ToastrService
  ) {
    const now = new Date();

    this.diagnosisheet = this.fb.group({
      uniqueHealthIdentificationId: ['', Validators.required],
      patient_name: [''],
      uhid: [''],
      age: [''],
      gender: [''],
      type: ['outpatientDepartment'],

      // Missing controls added here 👇
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
      allergy: [''],
      testprescription: [''],

      quantity: [0],
      packages: this.fb.array([]),
      medicinesArray: this.fb.array([]),
      respiratoryRate: [0],

      nextFollowUpDate: [''],
      primaryDiagnosis: [''],
      extraDetails: [''],
      generalAdvice: [''],
      outpatientCaseId: [''],
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  userPermissions: any = {};
  pharmapermission: any = {};

  onMedicineSelected(index: number) {
    const formGroup = this.medicinesArray.at(index);
    const selectedMedicineName = formGroup.get('medicine_name')?.value;

    const selectedMedicine = this.medicines.find(
      (med) => med.medicine_name === selectedMedicineName
    );

    if (selectedMedicine) {
      formGroup.get('charge')?.setValue(selectedMedicine.price);
    }
  }

  userId: string = '';

  ngOnInit(): void {
    // ✅ Route parameter handling for both create and edit modes
    this.route.queryParams.subscribe((params) => {
      const patientId = params['_id']; // For creating new diagnosis from patient
      const diagnosisId = params['id']; // For editing existing diagnosis

      if (diagnosisId) {
        // Edit mode
        this.editMode = true;
        this.diagnosisId = diagnosisId;
        this.updateDiagnosis(diagnosisId);
      } else if (patientId) {
        // Create mode from patient
        this.editMode = false;
        this.loadOpdDignosisByPatientId(patientId);
      }
    });

    const userData = localStorage.getItem('authUser');

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user?._id || '';
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
      }
    }

    this.searchForm = this.fb.group({
      searchText: [''],
    });

    // load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'diagnosisSheet'
    );
    const pharmareqModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
    );

    this.userPermissions = uhidModule?.permissions || {};
    this.pharmapermission = pharmareqModule?.permissions;

    const pharmacyId: string = '68beb0b38066685ac24f8017';

    // add medicine search
    this.medicineSearchControl.valueChanges
      .pipe(
        startWith('' as string),
        map((val) => val ?? ''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => {
          const term = searchTerm.trim();
          if (term.length > 1) {
            return this.masterService.getSubPharmacyInventoryItems(
              pharmacyId,
              1,
              10,
              term
            );
          } else {
            return of({ data: [] });
          }
        })
      )
      .subscribe((res: any) => {
        this.filteredMedicines = res?.data || [];
      });

    // symptoms search
    this.searchForm
      .get('searchText')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.symptomSearchTerm = searchTerm || '';
        this.currentPage = 1;
        this.loadSymptoms();
      });

    // uhid
    this.loadTodaysUHID();

    // by patient name
    const nameControl = this.diagnosisheet.get('patient_name');
    const UHIDControl = this.diagnosisheet.get('uhid');

    combineLatest([
      nameControl!.valueChanges.pipe(startWith('')),
      UHIDControl!.valueChanges.pipe(startWith('')),
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
            ? this.uhidService.getPatientByFilters(filters)
            : of({ uhids: [] });
        })
      )
      .subscribe((response: any) => {
        if (this.manuallySelected) return;

        this.filteredPatients = response?.uhids || [];
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

    // Load medicines
    this.masterService.getMedicine().subscribe({
      next: (res) => {
        this.medicines = res.data || [];
      },
      error: (err) => {
        console.error('Error fetching medicines:', err);
      },
    });
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
    const index = this.selectedSymptoms.findIndex(s => s._id === symptom._id);

    if (index > -1) {
      this.selectedSymptoms.splice(index, 1);
    } else {
      this.selectedSymptoms.push(symptom);
    }
  }

  // Check if symptom is selected
  isSymptomSelected(symptom: any): boolean {
    return this.selectedSymptoms.some(s => s._id === symptom._id);
  }

  // Remove individual selected symptom
  removeSelectedSymptom(symptom: any): void {
    const index = this.selectedSymptoms.findIndex(s => s._id === symptom._id);
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
    this.selectedSymptoms.forEach(symptom => {
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

  // uhid for today's
  showUHIDDropdown: boolean = false;

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        const allRecords = res.data.inpatientCases || [];

        this.uhidTodayRecords = allRecords.filter((record: any) => {
          const admissionDate = new Date(record.admissionDate)
            .toISOString()
            .split('T')[0];
          return admissionDate === today;
        });
      },
      (err) => {
        console.error("Error loading today's UHID:", err);
      }
    );
  }

  selectPatientFromUHID(record: any): void {
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

  addMedicineRow() {
    const medicineGroup = this.fb.group({
      medicine_name: [''],
      checkbox: this.fb.group({
        morning: [false],
        noon: [false],
        evening: [false],
        night: [false],
      }),
      quantity: [0],
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

  stockWarning: boolean = false;

  selectMedicine(med: any) {
    // ❌ Block only if pharma user and stock = 0
    if (this.pharmapermission && med.current_stock === 0) {
      this.stockWarning = true;
      setTimeout(() => (this.stockWarning = false), 3000);
      return;
    }

    // ✅ Prevent duplicates
    const alreadyExists = this.medicinesArray.controls.some(
      (ctrl) => ctrl.get('medicine_name')?.value === med.medicine_name
    );

    const price =
      med?.medicine?.price ?? med?.batch_details?.[0]?.unit_price ?? 0;

    if (!alreadyExists) {
      this.medicinesArray.push(
        this.fb.group({
          medicine_name: [med.medicine_name],
          quantity: [1],
          charge: [price],
          availableStock: [med.current_stock],
          dosageInstruction: [med.dosageInstruction || ''],
          checkbox: this.fb.group({
            morning: [false],
            noon: [false],
            evening: [false],
            night: [false],
          }),
        })
      );
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
      this.packages = response.pkg;
    });
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

  selectPatient(patient: any): void {
    this.manuallySelected = true;
    this.diagnosisheet.patchValue({
      uhid: patient.uhid || '',
      patient_name: patient.patient_name,
      age: patient.age || '',
      gender: patient.gender || '',
      patientUhidId: patient._id,
      uniqueHealthIdentificationId: patient._id || '',
      UHID: patient._id || '',
    });
    this.showSuggestions = false;
    this.filteredPatients = [];
  }

  onPatientInput() {
    const searchTerm = this.diagnosisheet.get('patient_name')?.value;

    // Reset the flag if user starts editing the field again
    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }

    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    // Allow API call again once flag is reset
    this.showSuggestions = true;
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  // ✅ Helper method to check if valid medicines exist
  hasValidMedicines(): boolean {
    const medicines = this.diagnosisheet.get('medicinesArray')?.value || [];
    return medicines.some((med: any) =>
      med.medicine_name &&
      med.medicine_name.trim() !== '' &&
      med.quantity > 0
    );
  }

  // ✅ Helper method to check if diagnosis response has packages
  diagnosisHasPackages(diagnosisResponse: any): boolean {
    return !!(diagnosisResponse?.data?.packages && diagnosisResponse.data.packages.length > 0) ||
           !!(diagnosisResponse?.packages && diagnosisResponse.packages.length > 0) ||
           !!(diagnosisResponse?.hasMedicines === true);
  }

  // ✅ Updated buildFormattedDiagnosisData to handle optional packages
  buildFormattedDiagnosisData(): any {
    const raw = this.diagnosisheet.value;

    // ✅ Only include packages if medicines exist
    const medicinesArray = raw.medicinesArray || [];
    const validMedicines = medicinesArray.filter((med: any) =>
      med.medicine_name && med.medicine_name.trim() !== '' && med.quantity > 0
    );

    const diagnosisData: any = {
      uniqueHealthIdentificationId:
        raw.uniqueHealthIdentificationId?._id ||
        raw.uniqueHealthIdentificationId,
      inpatientCaseId: raw.inpatientCaseId,
      outpatientCaseId: this.opdcaseid,
      vitals: {
        systolicBloodPressure: +raw.systolicBloodPressure || 0,
        diastolicBloodPressure: +raw.diastolicBloodPressure || 0,
        bloodGroup: raw.bloodGroup,
        temperature: +raw.temperature || 0,
        height: +raw.height || 0,
        weight: +raw.weight || 0,
        pulseRate: +raw.pulseRate || 0,
        spo2: +raw.spo2 || 0,
        bloodSugar: +raw.bloodSugar || 0,
        respiratoryRate: +raw.respiratoryRate || 0,
      },
      symptoms: this.symptomRows.map((sym) => ({
        name: sym.symptomName,
        properties: sym.properties,
        since: sym.since,
        remarks: sym.remarks,
      })),
      clinicalExamination: raw.clinicalExamination,
      diagnosis: raw.diagnosis,
      medicalHistory: raw.medicalHistory,
      type: 'outpatientDepartment',
      nextFollowUpDate: raw.nextFollowUpDate,
      primaryDiagnosis: raw.primaryDiagnosis,
      extraDetails: raw.extraDetails,
      generalAdvice: raw.generalAdvice,
      allergy: raw.allergy,
      testprescription: raw.testprescription,
    };

    // ✅ Only add packages if there are valid medicines
    if (validMedicines.length > 0) {
      diagnosisData.packages = validMedicines.map((med: any) => ({
        medicineName: med.medicine_name,
        quantity: Number(med.quantity) || 0,
        charge: Number(med.charge) || 0,
        dosageInstruction: med.dosageInstruction || '',
        checkbox: {
          morning: !!med.checkbox?.morning,
          noon: !!med.checkbox?.noon,
          evening: !!med.checkbox?.evening,
          night: !!med.checkbox?.night,
        },
      }));
    }

    return diagnosisData;
  }

  // ✅ Updated buildPrescribedMed to handle optional medicines
  buildPrescribedMed(): any {
    const raw = this.diagnosisheet.value;

    const medicinesArray = raw.medicinesArray || [];
    const validMedicines = medicinesArray.filter((med: any) =>
      med.medicine_name &&
      med.medicine_name.trim() !== '' &&
      med.quantity > 0
    );

    // ✅ Return null if no valid medicines
    if (validMedicines.length === 0) {
      return null;
    }

    return {
      uniqueHealthIdentificationId:
        raw.uniqueHealthIdentificationId?._id ||
        raw.uniqueHealthIdentificationId,
      outpatientCaseUniqueId: this.opdcaseid,
      patientType: 'outpatientDepartment',
      status: 'pending',
      requestForType: 'sales',
      pharmacistUserId: this.userId,
      billingType: 'cash',
      packages: validMedicines.map((med: any) => ({
        medicineName: med.medicine_name,
        quantity: Number(med.quantity) || 0,
        charge: Number(med.charge) || 0,
        dosageInstruction: med.dosageInstruction || '',
        checkbox: {
          morning: !!med.checkbox?.morning,
          noon: !!med.checkbox?.noon,
          evening: !!med.checkbox?.evening,
          night: !!med.checkbox?.night,
        },
      })),
    };
  }

  // ✅ Updated updateDiagnosis method for editing existing diagnosis
  updateDiagnosis(diagnosisId: string) {
    this.doctorservice.getDiagnosisbyID(diagnosisId).subscribe((res) => {
      console.log('diagnosis by id', res);
      const raw = res;

      // ✅ Set the opdcaseid from the response
      this.opdcaseid = raw?.outpatientCaseId?._id || raw?.outpatientCaseId || '';

      // ✅ First patch basic form values
      this.diagnosisheet.patchValue({
        uhid: raw?.uniqueHealthIdentificationId?.uhid || '',
        patient_name: raw?.uniqueHealthIdentificationId?.patient_name || '',
        age: raw?.uniqueHealthIdentificationId?.age || '',
        gender: raw?.uniqueHealthIdentificationId?.gender || '',
        uniqueHealthIdentificationId: raw?.uniqueHealthIdentificationId?._id || raw?.uniqueHealthIdentificationId,
        outpatientCaseId: raw?.outpatientCaseId?._id || raw?.outpatientCaseId || '',

        // ✅ Patch vitals data
        systolicBloodPressure: raw?.vitals?.systolicBloodPressure || '',
        diastolicBloodPressure: raw?.vitals?.diastolicBloodPressure || '',
        bloodGroup: raw?.vitals?.bloodGroup || '',
        temperature: raw?.vitals?.temperature || '',
        height: raw?.vitals?.height || '',
        weight: raw?.vitals?.weight || '',
        pulseRate: raw?.vitals?.pulseRate || '',
        spo2: raw?.vitals?.spo2 || '',
        bloodSugar: raw?.vitals?.bloodSugar || '',
        respiratoryRate: raw?.vitals?.respiratoryRate || '',

        // ✅ Patch diagnosis data
        clinicalExamination: raw?.clinicalExamination || '',
        diagnosis: raw?.diagnosis || '',
        medicalHistory: raw?.medicalHistory || '',
        type: raw?.type || 'outpatientDepartment',
        nextFollowUpDate: raw?.nextFollowUpDate || '',
        primaryDiagnosis: raw?.primaryDiagnosis || '',
        extraDetails: raw?.extraDetails || '',
        generalAdvice: raw?.generalAdvice || '',
        allergy: raw?.allergy || '',
        testprescription: raw?.testprescription || '',
      });

      this.manuallySelected = true;

      // ✅ Populate symptom rows
      this.symptomRows = (raw?.symptoms || []).map((symptom: any) => ({
        symptomName: symptom.name || '',
        properties: symptom.properties || '',
        since: symptom.since || '',
        remarks: symptom.remarks || '',
      }));

      // ✅ Clear existing medicines FormArray and populate with new data
      const medicinesArray = this.diagnosisheet.get('medicinesArray') as FormArray;

      // Clear existing form controls
      while (medicinesArray.length !== 0) {
        medicinesArray.removeAt(0);
      }

      // ✅ Add medicine data from packages array
      if (raw?.packages && raw.packages.length > 0) {
        raw.packages.forEach((packageItem: any) => {
          const medicineGroup = this.fb.group({
            medicine_name: [packageItem.medicineName || ''],
            quantity: [packageItem.quantity || 1],
            charge: [packageItem.charge || 0],
            availableStock: [packageItem.availableStock || 0],
            dosageInstruction: [packageItem.dosageInstruction || ''],
            checkbox: this.fb.group({
              morning: [packageItem.checkbox?.morning || false],
              noon: [packageItem.checkbox?.noon || false],
              evening: [packageItem.checkbox?.evening || false],
              night: [packageItem.checkbox?.night || false],
            }),
          });

          medicinesArray.push(medicineGroup);
        });
      } else {
        // ✅ Add at least one empty medicine row if no packages exist
        this.addMedicineRow();
      }

      console.log('✅ Form patched successfully with:', {
        symptoms: this.symptomRows.length,
        medicines: medicinesArray.length,
        formValue: this.diagnosisheet.value
      });
    });
  }

  // ✅ Updated OnSubmit method to handle both create and update
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
    console.log('🚀 ~ DiagnosisComponent ~ OnSubmit ~ formattedData:', formattedData);

    // ✅ Check if we're in edit mode or create mode
    if (this.editMode && this.diagnosisId) {
      // ====== UPDATE MODE ======
      this.doctorservice.updateDiagnosissheet(this.diagnosisId, formattedData).subscribe({
        next: (res) => {
          console.log('✅ Diagnosis sheet updated successfully:', res);

          // ✅ Check if diagnosis response indicates packages exist
          const diagnosisHasMedicines = this.diagnosisHasPackages(res);
          console.log('🚀 Diagnosis has medicines:', diagnosisHasMedicines);

          // ✅ Only call pharmacy API if diagnosis has packages AND user has permissions
          if (diagnosisHasMedicines) {
            const pharmaPerm = this.pharmapermission || {};

            if (pharmaPerm.create === 1 || pharmaPerm.update === 1) {
              const formattedPrescribedMed = this.buildPrescribedMed();
              console.log('🚀 ~ DiagnosisComponent ~ OnSubmit ~ formattedPrescribedMed:', formattedPrescribedMed);

              if (formattedPrescribedMed) {
                this.doctorservice.postPharmareq(formattedPrescribedMed).subscribe({
                  next: (pharmaRes) => {
                    console.log('✅ Pharmacy request submitted successfully:', pharmaRes);
                    this.showSuccessAndRedirect(res, true, 'Diagnosis updated successfully!');
                  },
                  error: (pharmaErr) => {
                    console.error('❌ Error submitting pharmacy request:', pharmaErr);
                    this.showSuccessAndRedirect(res, false, 'Diagnosis updated but pharmacy request failed.');
                  },
                });
              } else {
                console.log('ℹ️ No valid medicines to submit to pharmacy');
                this.showSuccessAndRedirect(res, false, 'Diagnosis updated successfully!');
              }
            } else {
              console.warn('❌ User does not have pharmacy create/update permission');
              this.showSuccessAndRedirect(res, false, 'Diagnosis updated successfully!');
            }
          } else {
            console.log('ℹ️ Diagnosis has no packages - skipping pharmacy request');
            this.showSuccessAndRedirect(res, false, 'Diagnosis updated successfully!');
          }
        },
        error: (err) => {
          console.error('❌ Error updating diagnosis sheet:', err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err?.error?.message || 'An error occurred while updating the diagnosis sheet.',
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
      // ====== CREATE MODE ======
      this.doctorservice.postDiagnosissheet(formattedData).subscribe({
        next: (res) => {
          console.log('✅ Diagnosis sheet submitted successfully:', res);

          // ✅ Check if diagnosis response indicates packages exist
          const diagnosisHasMedicines = this.diagnosisHasPackages(res);
          console.log('🚀 Diagnosis has medicines:', diagnosisHasMedicines);

          // ✅ Only call pharmacy API if diagnosis has packages AND user has permissions
          if (diagnosisHasMedicines) {
            const pharmaPerm = this.pharmapermission || {};

            if (pharmaPerm.create === 1 || pharmaPerm.update === 1) {
              const formattedPrescribedMed = this.buildPrescribedMed();
              console.log('🚀 ~ DiagnosisComponent ~ OnSubmit ~ formattedPrescribedMed:', formattedPrescribedMed);

              if (formattedPrescribedMed) {
                this.doctorservice.postPharmareq(formattedPrescribedMed).subscribe({
                  next: (pharmaRes) => {
                    console.log('✅ Pharmacy request submitted successfully:', pharmaRes);
                    this.showSuccessAndRedirect(res, true);
                  },
                  error: (pharmaErr) => {
                    console.error('❌ Error submitting pharmacy request:', pharmaErr);
                    this.showSuccessAndRedirect(res, false, 'Diagnosis saved but pharmacy request failed.');
                  },
                });
              } else {
                console.log('ℹ️ No valid medicines to submit to pharmacy');
                this.showSuccessAndRedirect(res, false);
              }
            } else {
              console.warn('❌ User does not have pharmacy create/update permission');
              this.showSuccessAndRedirect(res, false, 'Diagnosis saved. No pharmacy permissions.');
            }
          } else {
            console.log('ℹ️ Diagnosis has no packages - skipping pharmacy request');
            this.showSuccessAndRedirect(res, false);
          }
        },
        error: (err) => {
          console.error('❌ Error submitting diagnosis sheet:', err);
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: err?.error?.message || 'An error occurred while submitting the diagnosis sheet.',
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

  // ✅ Updated helper method for success handling and redirect
  private async showSuccessAndRedirect(res: any, pharmacySuccess: boolean, customMessage?: string) {
    const Swal = (await import('sweetalert2')).default;

    let message: string;

    if (customMessage) {
      message = customMessage;
    } else if (this.editMode) {
      message = res?.message || 'The diagnosis record has been updated successfully!';
      if (pharmacySuccess) {
        message += ' Pharmacy request also updated successfully.';
      }
    } else {
      message = res?.message || 'The diagnosis record has been submitted successfully!';
      if (pharmacySuccess) {
        message += ' Pharmacy request also submitted successfully.';
      }
    }

    Swal.fire({
      icon: 'success',
      title: this.editMode ? 'Diagnosis Sheet Updated' : 'Diagnosis Sheet Created',
      text: message,
      position: 'top-end',
      toast: true,
      timer: 4000,
      showConfirmButton: false,
      customClass: {
        popup: 'hospital-toast-popup',
        title: 'hospital-toast-title',
        htmlContainer: 'hospital-toast-text',
      },
    });

    // ✅ Reset form and navigate
    this.diagnosisheet.reset();
    this.symptomRows = [];
    this.medicinesArray.clear();

    // ✅ Navigate to appropriate page based on case type
    const caseId = res?.outpatientCaseId || res?.data?.outpatientCaseId;
    console.log('Extracted CaseId:', caseId);

    if (caseId) {
      this.router.navigate(['/patientsummary'], {
        queryParams: { id: caseId },
      });
    } else {
      console.error('Case ID not found in response');
      // Fallback navigation
      this.router.navigate(['/opd/opddiagnosissheetlist']);
    }
  }

  patient: any[] = [];

  loadOpdDignosisByPatientId(patientId: string) {
    this.opdservice.getOPDcaseById(patientId).subscribe({
      next: (opdcase: any) => {
        console.log('opdcase', opdcase);
        this.patient = opdcase;
        this.opdcaseid = opdcase._id;
        const uhidId = opdcase.uniqueHealthIdentificationId._id;

        // Fetch UHID details separately
        this.uhidService.getUhidById(uhidId).subscribe({
          next: (uhid: any) => {
            this.diagnosisheet.patchValue({
              uhid: uhid.uhid || '',
              patient_name: uhid.patient_name || '',
              age: uhid.age || '',
              gender: uhid.gender || '',
              uniqueHealthIdentificationId: uhid._id,
              patientUhidId: uhid._id,
            });
            this.manuallySelected = true;
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

  checkQuantity(index: number): void {
    const row = this.medicinesArray.at(index);
    const enteredQty = row.get('quantity')?.value;
    const available = row.get('availableStock')?.value;

    // ✅ Only enforce stock restriction if user has pharma permission
    if (this.pharmapermission) {
      if (enteredQty > available) {
        row.get('quantity')?.setValue(available);
        this.toastr.warning(
          `Only <strong>${available}</strong> units are available in stock.`,
          'Stock Limit Exceeded',
          {
            enableHtml: true,
            timeOut: 5000,
            positionClass: 'toast-bottom-right',
            closeButton: true,
            progressBar: true,
          }
        );
      }
    }

    // ✅ Minimum quantity always enforced (for everyone)
    if (enteredQty < 1) {
      row.get('quantity')?.setValue(1);
      this.toastr.info(
        `Minimum quantity is <strong>1</strong>.`,
        'Invalid Quantity',
        {
          enableHtml: true,
          timeOut: 3000,
          positionClass: 'toast-bottom-right',
          closeButton: true,
        }
      );
    }
  }

  // ✅ Enhanced remove medicine method
  removeMedicineRow(index: number) {
    this.medicinesArray.removeAt(index);

    // Show info if all medicines are removed
    if (this.medicinesArray.length === 0) {
      this.toastr.info(
        'All medicines removed. No pharmacy request will be created.',
        'No Medicines',
        {
          timeOut: 3000,
          positionClass: 'toast-bottom-right',
          closeButton: true,
        }
      );
    }
  }

  updateDosageInstruction(event: any, value: string, index: number) {
    const dosageControl = (this.medicinesArray.at(index) as FormGroup).get(
      'dosageInstruction'
    );
    let currentVal = dosageControl?.value || '';

    // Split by comma and trim each value
    let parts = currentVal
      ? currentVal
          .split(',')
          .map((v: any) => v.trim())
          .filter((v: any) => v)
      : [];

    if (event.target.checked) {
      if (!parts.includes(value)) {
        parts.push(value);
      }
    } else {
      parts = parts.filter((v: string) => v !== value);
    }

    // Join with a comma and space
    currentVal = parts.join(', ');
    dosageControl?.setValue(currentVal);
  }

  // search section
  get searchTextControl(): FormControl {
    return this.searchForm.get('searchText') as FormControl;
  }
}
