import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { DoctorService } from '../../doctorservice/doctor.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pharmacyreq',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pharmacyreq.component.html',
  styleUrls: ['./pharmacyreq.component.css'],
})
export class PharmacyreqComponent {
  saveAsPackage: boolean = false;
  pharmareq: FormGroup;
  manuallySelected = false;
  filteredPatients: any[] = [];

  // ✅ Enhanced package selection properties
  selectedPackages: any[] = [];
  showPackageList: boolean = false;
  medicineSearchLoading: boolean = false;

  // ✅ Save as Package properties
  showSavePackageModal: boolean = false;
  packageCreationForm: FormGroup;
  symptomGroups: any[] = [];
  isSubmittingPackage: boolean = false;

  showSuggestions = false;
  selectedPatient: any = null;
  selectedPatientDetails: any = null;
  editMode: boolean = false;
  medicines: any[] = [];
  packages: any[] = [];
  selectedPackage: any = null;
  newMedicineRows: any[] = [];
  ipdpharma: any[] = [];
  selectedPharmacyId: string = '68beb0b38066685ac24f8017'; // ✅ Your actual pharmacy ID
  filteredPackages: any[] = [];
  showPackageSuggestions: boolean = false;
  userId: string = '';
  uhids: any[] = [];
  ipdId: string = '';
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  uhidTodayRecords: any[] = [];
  packageSearchTerm: string = '';
  userPermissions: any = {};
  pharmaIpdPermission: any = {};
  hasAccess: boolean = false;
  medicineSearchControl = new FormControl<string>(''); // ✅ Type-safe FormControl
  filteredMedicines: any[] = [];
  showSearchBox = false;
  stockWarning: boolean = false;
  showUHIDDropdown: boolean = false;
  patientSelected: boolean = false;
  pharmareqid: string = '';
  pharmacyInventory: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ipdservice: IpdService,
    private masterservice: MasterService,
    private doctorservice: DoctorService,
    private uhidService: UhidService,
    private toastr: ToastrService
  ) {
    this.pharmareq = this.fb.group({
      uniqueHealthIdentificationId: [''],
      caseNo: [''],
      inpatientCaseUniqueId: [''],
      patient_type: ['inpatientDepartment'],
      patient_name: ['', Validators.required],
      requestfor: ['Sales', Validators.required],
      billtype: ['cash', Validators.required],
      charge: [],
      additionalRemarks: [''],
      pharmacistUserUniqueId: [''],
      status: ['pending'],
      quantity: [[0]],
      pharmacistUserId: this.userId,
      packageSearch: [''],
      packages: this.fb.array([]),
      medicinesArray: this.fb.array([]),
      selectedPackages: this.fb.array([]),
    });

    this.packageCreationForm = this.fb.group({
      packagename: ['', [Validators.required, Validators.minLength(3)]],
      symptom_group: ['', Validators.required],
      intake: [''],
      advice: [''],
      checkbox: this.fb.group({
        morning: [false],
        noon: [false],
        evening: [false],
        night: [false],
      }),
    });
  }

  ngOnInit(): void {
    // ✅ 1. Initialize user data
    const userData = localStorage.getItem('authUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user?._id || '';
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
      }
    }

    // ✅ 2. Set the sub-pharmacy ID
    this.selectedPharmacyId = '68beb0b38066685ac24f8017';

    // ✅ 3. Load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
    );
    const pharma = allPermissions.find(
      (perm: any) => perm.moduleName === 'ipdpharmaceuticalRequestList'
    );

    this.userPermissions = uhidModule?.permissions || {};
    this.pharmaIpdPermission = pharma?.permissions || {};
    this.hasAccess = this.hasAnyAccess();

    // ✅ 4. Handle route parameters
    this.route.queryParams.subscribe((params: any) => {
      const ipdId = params['id'];
      if (ipdId) {
        this.ipdId = ipdId;
        this.patientFromcase(ipdId);
      }

      this.pharmareqid = params['_id'] || null;
      if (this.pharmareqid) {
        this.editMode = true;
        this.loadPharmareq(this.pharmareqid);
      }
    });

    // ✅ 5. Load initial data
    this.ipdservice.getIPDcase().subscribe((res: any) => {
      this.ipdpharma = res?.data?.inpatientCases || [];
      this.enablePatientSearch();
    });

    this.loadTodaysUHID();
    this.loadSymptomGroups();
    this.loadAllPackages();

    // ✅ 6. Setup patient search
    const nameControl = this.pharmareq.get('patient_name');
    const uhidControl = this.pharmareq.get('caseNo');

    combineLatest([
      nameControl!.valueChanges.pipe(startWith('')),
      uhidControl!.valueChanges.pipe(startWith('')),
    ])
      .pipe(
        debounceTime(300),
        switchMap(([patient_name, caseNo]) => {
          if (this.manuallySelected || this.patientSelected || this.editMode) {
            return of({ uhids: [] });
          }

          const filters: { [key: string]: string } = {};
          if (patient_name && patient_name.length > 2)
            filters['patient_name'] = patient_name;
          if (caseNo && caseNo.length > 2) filters['uhid'] = caseNo;

          return Object.keys(filters).length
            ? this.uhidService.getPatientByFilters(filters)
            : of({ uhids: [] });
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.uhids || [];
        if (!this.patientSelected && !this.manuallySelected && !this.editMode) {
          this.showSuggestions = this.filteredPatients.length > 0;
        } else {
          this.showSuggestions = false;
        }
      });

    // ✅ 7. Setup medicine search with API calls - FIXED
    // ✅ 7. Setup medicine search with API calls - FIXED TypeScript Error
    this.medicineSearchControl.valueChanges
      .pipe(
        startWith(''), // ✅ Start with empty string to handle null values
        map((value: string | null) => value || ''), // ✅ Convert null to empty string
        debounceTime(500),
        distinctUntilChanged(), // ✅ Now works with consistent string type
        switchMap((searchTerm: string) => {
          console.log('🔍 Medicine search term:', searchTerm);

          if (!searchTerm?.trim() || searchTerm.trim().length < 2) {
            this.filteredMedicines = [];
            this.medicineSearchLoading = false;
            return of([]);
          }

          const cleanTerm = searchTerm.trim();

          if (!this.selectedPharmacyId) {
            console.error('❌ Selected pharmacy ID not set');
            this.toastr.error('Pharmacy not selected', 'Error');
            return of([]);
          }

          this.medicineSearchLoading = true;

          console.log('🏥 Making API call with:', {
            pharmacyId: this.selectedPharmacyId,
            searchTerm: cleanTerm,
          });

          return this.masterservice
            .getSubPharmacyInventoryItems(
              this.selectedPharmacyId,
              1,
              25,
              cleanTerm
            )
            .pipe(
              map((response: any) => {
                console.log('📡 API Response:', response);
                const medicines = response?.data || [];
                console.log(
                  `📋 Found ${medicines.length} medicines in API response`
                );

                if (medicines.length > 0) {
                  console.log('📝 First medicine sample:', medicines[0]);
                }

                return medicines;
              }),
              catchError((error) => {
                console.error('❌ Medicine search API error:', error);
                this.toastr.error(
                  'Failed to search medicines from sub-pharmacy inventory',
                  'Search Error'
                );
                return of([]);
              }),
              finalize(() => {
                this.medicineSearchLoading = false;
                console.log('🏁 Medicine search API call completed');
              })
            );
        })
      )
      .subscribe((medicines: any[]) => {
        console.log('✅ Processing medicines from API:', medicines);

        const medicinesArray = this.pharmareq.get(
          'medicinesArray'
        ) as FormArray;
        const addedMedicineIds = medicinesArray.controls.map(
          (ctrl) => ctrl.get('medicine_id')?.value
        );

        this.filteredMedicines = medicines.filter((inventoryItem) => {
          const medicineId = inventoryItem.medicine?._id || inventoryItem._id;
          return !addedMedicineIds.includes(medicineId);
        });

        console.log(
          `🎯 Final filtered medicines count: ${this.filteredMedicines.length}`
        );
      });

    this.initializePharmacyInventory();
  }

  // ✅ FIXED - Select individual medicine with correct stock handling
  selectIndividualMedicine(inventoryItem: any) {
    console.log('🔍 Selecting medicine from inventory:', inventoryItem);

    const medicine = inventoryItem.medicine || inventoryItem;

    // ✅ Use current_stock from inventory API response
    if (inventoryItem.current_stock === 0) {
      this.toastr.error(
        'This medicine is currently out of stock.',
        'Stock Unavailable'
      );
      return;
    }

    if (this.isMedicineAlreadySelected(medicine._id)) {
      this.toastr.warning(
        'This medicine is already selected',
        'Duplicate Selection'
      );
      return;
    }

    const bestPrice = this.getBestPrice(inventoryItem);

    const medicineFormGroup = this.fb.group({
      medicine_id: [medicine._id],
      medicine_name: [inventoryItem.medicine_name || medicine.medicine_name],
      medicinename: [medicine.medicine_name],
      quantity: [1, [Validators.required, Validators.min(1)]],
      charge: [bestPrice],
      availableStock: [inventoryItem.current_stock || 0], // ✅ FIXED - Use current_stock
      packageSource: ['Individual Selection'],
      checkbox: this.fb.group({
        morning: [false],
        noon: [false],
        night: [false],
      }),
    });

    this.medicinesArray.push(medicineFormGroup);
    this.medicineSearchControl.setValue('');
    this.filteredMedicines = [];

    this.toastr.success(
      `${inventoryItem.medicine_name} added to prescription`,
      'Medicine Added'
    );
  }

  // ✅ Helper methods
  getBestPrice(inventoryItem: any): number {
    if (inventoryItem.batch_details && inventoryItem.batch_details.length > 0) {
      const validBatch = inventoryItem.batch_details.find(
        (batch: any) => batch.unit_price > 0
      );
      if (validBatch) {
        return validBatch.unit_price;
      }
    }
    return inventoryItem.medicine?.price || 0;
  }

  isMedicineAlreadySelected(medicineId: string): boolean {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    return medicinesArray.controls.some(
      (control) => control.get('medicine_id')?.value === medicineId
    );
  }

  isPackageAlreadySelected(packageId: string): boolean {
    return this.selectedPackages.some((pkg) => pkg._id === packageId);
  }

  // ✅ All other existing methods remain the same...
  // [Include all your existing methods here - loadSymptomGroups, onPackageSelect, etc.]

  private initializePharmacyInventory(): void {
    if (!this.selectedPharmacyId) {
      console.error(
        '❌ Cannot initialize pharmacy inventory - selectedPharmacyId not set'
      );
      return;
    }

    this.masterservice
      .getSubPharmacyInventoryItems(this.selectedPharmacyId, 1, 5)
      .subscribe({
        next: (response: any) => {
          console.log('📦 Pharmacy inventory sample loaded:', response);
          const items = response?.data || [];
          if (items.length > 0) {
            console.log(
              '🧪 Sample medicines in inventory:',
              items.map((item: any) => item.medicine_name)
            );
          }
        },
        error: (error: any) => {
          console.error('❌ Error loading pharmacy inventory:', error);
          this.toastr.error(
            'Failed to load pharmacy inventory',
            'Inventory Error'
          );
        },
      });
  }

  loadSymptomGroups(): void {
    this.masterservice.getSymptomGrp().subscribe({
      next: (res: any) => {
        this.symptomGroups = res?.data || [];
      },
      error: (err) => {
        console.error('Error loading symptom groups:', err);
        this.toastr.error('Failed to load symptom groups', 'Error');
      },
    });
  }

  onPatientInputFocus(): void {
    if (!this.patientSelected && !this.manuallySelected && !this.editMode) {
      const currentValue = this.pharmareq.get('patient_name')?.value || '';
      if (currentValue.length >= 2) {
        this.showSuggestions = true;
      }
    }
  }

  onPatientInput(): void {
    const searchTerm = this.pharmareq.get('patient_name')?.value || '';

    if (searchTerm.length <= 2) {
      this.patientSelected = false;
      this.manuallySelected = false;
      this.selectedPatientDetails = null;
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }

    if (this.patientSelected || this.manuallySelected) {
      this.patientSelected = false;
      this.manuallySelected = false;
      this.selectedPatientDetails = null;
    }

    if (
      !this.patientSelected &&
      !this.manuallySelected &&
      !this.editMode &&
      this.filteredPatients.length > 0
    ) {
      this.showSuggestions = true;
    }
  }

  onPackageSearchInput(): void {
    const term =
      this.pharmareq.get('packageSearch')?.value?.trim().toLowerCase() || '';

    if (term.length >= 2) {
      this.filteredPackages = this.packages.filter(
        (pkg) =>
          pkg.packagename.toLowerCase().includes(term) &&
          !this.selectedPackages.some((selected) => selected._id === pkg._id)
      );
      this.showPackageSuggestions = true;
    } else {
      this.filteredPackages = [];
      this.showPackageSuggestions = false;
    }
  }
// :white_check_mark: Add medicines from all selected packages
  addMedicinesFromPackages(): void {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    medicinesArray.clear();
    this.selectedPackages.forEach((pkg) => {
      pkg?.medicines?.forEach((med: any) => {
        const alreadyExists = medicinesArray.controls.some((ctrl) => {
          const existingMedicineId =
            ctrl.get('medicine_id')?.value || ctrl.get('medicinename')?.value;
          const existingMedicineName = ctrl.get('medicine_name')?.value;
          return (
            existingMedicineId === (med.medicine || med._id || med.id) ||
            (existingMedicineName &&
              med.medicine_name &&
              existingMedicineName.toLowerCase().trim() ===
                med.medicine_name.toLowerCase().trim())
          );
        });
        if (!alreadyExists) {
          const unitPrice =
            med.batch_details?.[0]?.unit_price || med.price || 0;
          medicinesArray.push(
            this.fb.group({
              medicine_name: [med.medicine_name || med.medicinename],
              medicine_id: [med.medicine || med._id || med.id],
              medicinename: [med.medicine || med._id || med.id],
              quantity: [1],
              charge: [unitPrice],
              availableStock: [med.current_stock || med.stock || 0],
              packageSource: [pkg.packagename],
              checkbox: this.fb.group({
                morning: [pkg.checkbox?.morning || false],
                noon: [pkg.checkbox?.noon || false],
                evening: [pkg.checkbox?.evening || false],
                night: [pkg.checkbox?.night || false],
              }),
            })
          );
        }
      });
    });
  }
  // :white_check_mark: Multiple package selection
  onPackageSelect(pkg: any): void {
    const alreadySelected = this.selectedPackages.some(
      (selected) => selected._id === pkg._id
    );
    if (alreadySelected) {
      this.toastr.warning(
        `${pkg.packagename} is already selected.`,
        'Duplicate Package',
        {
          timeOut: 3000,
          positionClass: 'toast-bottom-right',
          closeButton: true,
          progressBar: true,
        }
      );
      return;
    }
    this.selectedPackages.push(pkg);
    const selectedPackagesArray = this.pharmareq.get(
      'selectedPackages'
    ) as FormArray;
    selectedPackagesArray.push(
      this.fb.group({
        packageId: [pkg._id],
        packageName: [pkg.packagename],
        packageData: [pkg],
      })
    );
    this.pharmareq.get('packageSearch')?.setValue('');
    this.showPackageSuggestions = false;
    this.showPackageList = true;
    this.addMedicinesFromPackages();
    this.toastr.success(
      `${pkg.packagename} added successfully.`,
      'Package Added',
      {
        timeOut: 2000,
        positionClass: 'toast-bottom-right',
        closeButton: true,
        progressBar: true,
      }
    );
  }
  removeSelectedPackage(index: number) {
    const packageToRemove = this.selectedPackages[index];
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;

    for (let i = medicinesArray.length - 1; i >= 0; i--) {
      const medicineControl = medicinesArray.at(i);
      const packageSource = medicineControl.get('packageSource')?.value;

      if (packageSource === packageToRemove.packagename) {
        medicinesArray.removeAt(i);
      }
    }

    this.selectedPackages.splice(index, 1);
    this.toastr.info(
      `Package "${packageToRemove.packagename}" removed`,
      'Package Removed'
    );
  }

  clearAllPackages() {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;

    for (let i = medicinesArray.length - 1; i >= 0; i--) {
      const medicineControl = medicinesArray.at(i);
      const packageSource = medicineControl.get('packageSource')?.value;

      if (packageSource !== 'Individual Selection') {
        medicinesArray.removeAt(i);
      }
    }

    this.selectedPackages = [];
    this.showPackageList = false;
    this.toastr.info(
      'All packages cleared. Individual medicines retained.',
      'Packages Cleared'
    );
  }

  clearAllMedicines() {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    medicinesArray.clear();

    this.selectedPackages = [];
    this.showPackageList = false;
    this.toastr.info(
      'All medicines and packages cleared',
      'Everything Cleared'
    );
  }

  showSaveAsPackageModal(): void {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;

    if (medicinesArray.length === 0) {
      this.toastr.warning(
        'Please add medicines before saving as package.',
        'No Medicines Selected'
      );
      return;
    }

    this.showSavePackageModal = true;
    const hasCommonDosage = this.getCommonDosagePattern();
    this.packageCreationForm.patchValue({ checkbox: hasCommonDosage });
  }

  getCommonDosagePattern(): any {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    if (medicinesArray.length === 0) {
      return { morning: false, noon: false, evening: false, night: false };
    }

    const firstMedicine = medicinesArray.at(0);
    const checkbox = firstMedicine.get('checkbox')?.value;

    const allSame = medicinesArray.controls.every((control) => {
      const medCheckbox = control.get('checkbox')?.value;
      return JSON.stringify(medCheckbox) === JSON.stringify(checkbox);
    });

    return allSame
      ? checkbox
      : { morning: false, noon: false, evening: false, night: false };
  }

  closeSaveAsPackageModal(): void {
    this.showSavePackageModal = false;
    this.packageCreationForm.reset();
  }

  async saveAsNewPackage(): Promise<void> {
    if (this.packageCreationForm.invalid || this.isSubmittingPackage) {
      this.packageCreationForm.markAllAsTouched();
      this.toastr.warning(
        'Please fill in all required fields.',
        'Form Incomplete'
      );
      return;
    }

    this.isSubmittingPackage = true;
    const Swal = (await import('sweetalert2')).default;

    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    const selectedMedicineIds = medicinesArray.controls.map(
      (control) =>
        control.get('medicine_id')?.value || control.get('medicinename')?.value
    );

    if (selectedMedicineIds.length === 0) {
      this.toastr.error('No medicines selected to save as package.', 'Error');
      this.isSubmittingPackage = false;
      return;
    }

    const packageData = {
      packagename: this.packageCreationForm.get('packagename')?.value,
      symptom_group: this.packageCreationForm.get('symptom_group')?.value,
      medicines: selectedMedicineIds,
      intake: this.packageCreationForm.get('intake')?.value || '',
      advice: this.packageCreationForm.get('advice')?.value || '',
      checkbox: this.packageCreationForm.get('checkbox')?.value,
    };

    this.masterservice.postPackages(packageData).subscribe({
      next: (response: any) => {
        this.isSubmittingPackage = false;
        this.closeSaveAsPackageModal();

        Swal.fire({
          icon: 'success',
          title: 'Package Created',
          text: `Package "${packageData.packagename}" has been created successfully.`,
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
        });

        this.loadAllPackages();
      },
      error: (err: any) => {
        this.isSubmittingPackage = false;
        console.error('Error creating package:', err);

        Swal.fire({
          icon: 'error',
          title: 'Package Creation Failed',
          text:
            err?.error?.message ||
            'Something went wrong while creating the package.',
        });
      },
    });
  }

  removeMedicineRow(index: number) {
    this.medicinesArray.removeAt(index);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  enablePatientSearch() {
    this.pharmareq
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) => {
          if (this.manuallySelected)
            return of({ data: { inpatientCases: [] } });
          return name && name.length > 2
            ? this.ipdservice.getIPDCaseByPatientName(name)
            : of({ data: { inpatientCases: [] } });
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.data?.inpatientCases || [];
        if (!this.patientSelected && !this.manuallySelected && !this.editMode) {
          this.showSuggestions = this.filteredPatients.length > 0;
        } else {
          this.showSuggestions = false;
        }
      });
  }

  toggleMedicineSearch(): void {
    this.showSearchBox = !this.showSearchBox;
    this.filteredMedicines = [];
    this.medicineSearchControl.reset();
  }

  patientFromcase(id: string) {
    this.ipdservice.getIPDcaseById(id).subscribe((res) => {
      const ipd = res.data || res;
      this.patientSelected = true;
      this.manuallySelected = true;
      this.selectedPatientDetails = ipd;

      this.pharmareq.patchValue({
        uniqueHealthIdentificationId:
          ipd?.uniqueHealthIdentificationId?._id || ipd?._id,
        caseNo: ipd?.uniqueHealthIdentificationId?.uhid || ipd.uhid,
        inpatientCaseUniqueId: res._id,
        patient_name:
          ipd?.uniqueHealthIdentificationId?.patient_name || ipd?.patient_name,
        bed_id: ipd?.bed_id?.bed_number,
        admittingDoctorId: ipd?.admittingDoctorId?.name,
      });

      setTimeout(() => {
        this.manuallySelected = true;
      }, 500);
    });
  }

  loadAllPackages(): void {
    const pageSize = 50;
    let currentPage = 1;
    let allPackages: any[] = [];

    const fetchNext = () => {
      this.masterservice.getPackages(currentPage, pageSize).subscribe({
        next: (res) => {
          const data = res?.pkg || [];
          allPackages = [...allPackages, ...data];
          if (data.length === pageSize) {
            currentPage++;
            fetchNext();
          } else {
            this.packages = allPackages;
            this.filteredPackages = [...this.packages];
          }
        },
        error: (err) => console.error('Error loading paginated packages:', err),
      });
    };
    fetchNext();
  }

  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];
    this.ipdservice.getIPDcase(1, 100, '').subscribe(
      (res) => {
        const allRecords = res.data?.inpatientCases || [];
        this.uhidTodayRecords = allRecords.filter((record: any) => {
          const admissionDate = new Date(record.admissionDate)
            .toISOString()
            .split('T')[0];
          return admissionDate === today;
        });
      },
      (err) => console.error("Error loading today's UHID:", err)
    );
  }

  loadPharmareq(opdpharmareqid: string) {
    this.doctorservice
      .getpharmareqById(opdpharmareqid)
      .subscribe((res: any) => {
        const opdpharmareq = res[0];
        if (opdpharmareq) {
          this.editMode = true;
          this.patientSelected = true;
          this.manuallySelected = true;

          this.ipdservice.getIPDcase(1, 100, '').subscribe((res) => {
            const uhids = res.data?.inpatientCases || [];
            this.ipdpharma = res.data.inpatientCases;
            this.uhids = uhids;

            const matchedUHID = this.uhids.filter(
              (u: any) =>
                u?.uniqueHealthIdentificationId?._id ===
                opdpharmareq?.uniqueHealthIdentificationId
            );

            const patientName =
              matchedUHID.length > 0
                ? matchedUHID[0]?.uniqueHealthIdentificationId?.patient_name ||
                  ''
                : '';
            const uhid =
              matchedUHID.length > 0
                ? matchedUHID[0]?.uniqueHealthIdentificationId?.uhid || ''
                : '';

            this.pharmareq.patchValue({
              patient_name: patientName,
              caseNo: uhid,
              billtype: opdpharmareq.billingType,
              requestforType: opdpharmareq.requestForType,
              status: opdpharmareq.status,
              uniqueHealthIdentificationId:
                opdpharmareq.uniqueHealthIdentificationId,
            });

            const packages = opdpharmareq.packages || [];
            this.medicinesArray.clear();

            packages.forEach((pkg: any) => {
              this.medicinesArray.push(
                this.fb.group({
                  medicine_name: [pkg.medicineName],
                  quantity: [pkg.quantity || 1],
                  charge: [pkg.charge || 0],
                  checkbox: this.fb.group({
                    morning: [pkg.checkbox?.morning || false],
                    noon: [pkg.checkbox?.noon || false],
                    evening: [pkg.checkbox?.evening || false],
                    night: [pkg.checkbox?.night || false],
                  }),
                })
              );
            });
          });
        }
      });
  }

  selectPatientFromUHID(record: any): void {
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }

  get medicinesArray(): FormArray {
    return this.pharmareq.get('medicinesArray') as FormArray;
  }

  selectPatient(patient: any): void {
    this.manuallySelected = true;
    this.patientSelected = true;
    this.selectedPatient = patient;
    this.selectedPatientDetails = patient;
    this.showSuggestions = false;
    this.filteredPatients = [];

    this.pharmareq.patchValue({
      uniqueHealthIdentificationId:
        patient?.uniqueHealthIdentificationId?._id || patient?._id,
      caseNo: patient?.uniqueHealthIdentificationId?.uhid || patient.uhid,
      inpatientCaseUniqueId: patient._id,
      patient_name:
        patient?.uniqueHealthIdentificationId?.patient_name ||
        patient?.patient_name,
      bed_id: patient?.bed_id?.bed_number,
      admittingDoctorId: patient?.admittingDoctorId?.name,
    });

    setTimeout(() => {
      this.showSuggestions = false;
    }, 100);
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      if (!this.manuallySelected) {
        this.showSuggestions = false;
      }
    }, 200);
  }

  hidePackageSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showPackageSuggestions = false;
    }, 200);
  }

  checkQuantity(index: number): void {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    const row = medicinesArray.at(index);
    const enteredQty = row.get('quantity')?.value;
    const available = row.get('availableStock')?.value || 0;
    const medicineName = row.get('medicine_name')?.value;

    if (enteredQty > available) {
      row.get('quantity')?.setValue(available);
      this.toastr.warning(
        `Only ${available} units of ${medicineName} are available in stock. Quantity adjusted.`,
        'Stock Limit Exceeded'
      );
      return;
    }

    if (enteredQty < 1) {
      row.get('quantity')?.setValue(1);
      this.toastr.info('Minimum quantity is 1 unit.', 'Invalid Quantity');
      return;
    }

    if (available === 0) {
      row.get('quantity')?.setValue(0);
      this.toastr.error(
        `${medicineName} is out of stock.`,
        'Stock Unavailable'
      );
    }
  }

  hasAnyAccess(): boolean {
    const hasPharmaceuticalAccess =
      this.userPermissions?.create === 1 || this.userPermissions?.read === 1;
    const hasDiagnosisAccess =
      this.pharmaIpdPermission?.create === 1 ||
      this.pharmaIpdPermission?.read === 1;
    return hasPharmaceuticalAccess || hasDiagnosisAccess;
  }

  getPackageMedicinesCount(): number {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    return medicinesArray.controls.filter(
      (ctrl) => ctrl.get('packageSource')?.value !== 'Individual Selection'
    ).length;
  }

  getIndividualMedicinesCount(): number {
    const medicinesArray = this.pharmareq.get('medicinesArray') as FormArray;
    return medicinesArray.controls.filter(
      (ctrl) => ctrl.get('packageSource')?.value === 'Individual Selection'
    ).length;
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.medicinesArray.length === 0) {
      this.toastr.error(
        'Please add at least one medicine.',
        'Validation Error'
      );
      return;
    }

    if (this.pharmareq.invalid) {
      this.pharmareq.markAllAsTouched();
      return;
    }

    const formValue = this.pharmareq.value;
    const payload = {
      uniqueHealthIdentificationId:
        formValue.uniqueHealthIdentificationId || '',
      inpatientCaseUniqueId: this.ipdId || '',
      requestForType: formValue.requestfor?.toLowerCase() || '',
      patientType: formValue.patient_type || '',
      pharmacistUserId: formValue.pharmacistUserId || this.userId,
      billingType: formValue.billtype || '',
      status: formValue.status || '',
      selectedPackages: this.selectedPackages.map((pkg) => ({
        packageId: pkg._id,
        packageName: pkg.packagename,
        medicineCount: pkg.medicines?.length || 0,
      })),
      packages: formValue.medicinesArray.map((med: any) => ({
        medicineName: med.medicine_name,
        quantity: Number(med.quantity) || 0,
        dosageInstruction: med.dosageInstruction || '',
        charge: Number(med.charge) || 0,
        packageSource: med.packageSource || '',
        checkbox: {
          morning: !!med.checkbox?.morning,
          noon: !!med.checkbox?.noon,
          evening: !!med.checkbox?.evening,
          night: !!med.checkbox?.night,
        },
        createdBy: this.userId,
      })),
    };

    const hasPharmacyUpdatePermission = this.userPermissions?.update === 1;
    const hasIpdPharmaPermission = this.pharmaIpdPermission?.create === 1;

    if (hasPharmacyUpdatePermission && this.pharmareqid) {
      this.doctorservice.updatePharmareq(this.pharmareqid, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Pharma Request Updated',
            text: 'Pharma request updated successfully!',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
          });
          this.pharmareq.reset();
          this.router.navigateByUrl('/doctor/pharmareqlist');
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err?.error?.message || 'Failed to update pharma request.',
          });
        },
      });
    } else if (hasIpdPharmaPermission) {
      this.doctorservice.postPharmareq(payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Pharma Request Sent',
            text: 'Pharma request sent successfully!',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
          });
          this.pharmareq.reset();

          if (res.inpatientCaseUniqueId) {
            this.router.navigate(['/ipdpatientsummary'], {
              queryParams: { id: res.inpatientCaseUniqueId },
            });
          } else {
            this.router.navigateByUrl('/ipdpatientsummary');
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: err?.error?.message || 'Failed to submit pharma request.',
          });
        },
      });
    } else {
      this.doctorservice.postwithoutPharmareq(payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Prescription Generated',
            text: 'Prescription has been generated successfully.',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
          });

          this.pharmareq.reset();

          if (this.ipdId) {
            this.router.navigate(['/ipdpatientsummary'], {
              queryParams: { id: this.ipdId },
            });
          } else {
            this.router.navigateByUrl('/ipdpatientsummary');
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Prescription Generation Failed',
            text: err?.error?.message || 'Failed to generate prescription.',
          });
        },
      });
    }
  }
}
