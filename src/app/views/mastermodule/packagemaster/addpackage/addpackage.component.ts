import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MasterService } from '../../masterservice/master.service';
// import Swal from 'sweetalert2';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-addpackage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './addpackage.component.html',
  styleUrls: ['./addpackage.component.css'],
})
export class AddpackageComponent implements OnInit {
  dropdownOpenSymptoms = false;
  dropdownOpenMedicines = false;
  symptoms: any[] = [];
  symptomGroup: any[] = [];
  medicines: any[] = [];
  selectedSymptoms: any[] = [];
  selectedMedicines: any[] = [];
  packagemaster!: FormGroup;
  editMode = false;
  packageId: string | null = null;
  isSubmitting = false;

  medicineSearchText: string = '';
  medicineSearchControl = new FormControl();
  filteredMedicines: any[] = [];

  name: string = '';

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  userPermissions: any = {};
  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'packages'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    this.initializeForm();

    // Fetch all symptoms and medicines
    this.masterService
      .getAllSymptoms()
      .subscribe((res) => (this.symptoms = res.data));

    // this.masterService.getMedicine().subscribe((res) => (this.medicines = res.data));

    this.masterService.getAllSymptomsGroup().subscribe((res) => {
      this.symptomGroup = res.data;
      console.log(
        '🚀 ~ SymtopmsGrouplistComponent ~ this.masterSymtopmsGroup.getSymptoms ~ symptoms:',
        this.symptomGroup
      );
    });

    // Check for package ID in route params for edit mode
    this.route.queryParams.subscribe((params) => {
      this.packageId = params['_id'] || null;
      this.editMode = !!this.packageId;

      // If editing, load the package data
      if (this.editMode && this.packageId) {
        this.loadPackage(this.packageId);
      }
    });

    const pharmacyId: string = '68beb0b38066685ac24f8017';

    // Medicine search logic with debounce
    this.medicineSearchControl.valueChanges
      .pipe(
        startWith('' as string),
        map((val: any) => val ?? ''),
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
        const rawMedicines = res?.data || [];

        this.filteredMedicines = rawMedicines.map((med: any) => {
          // ✅ Check if medicine is expired using your existing expiredMedicineNames set
          //  const isExpiredByName = this.expiredMedicineNames.has(med.medicine_name);

          // ✅ Also check if ALL batches are expired
          const allExpired =
            med.expired_batches?.length > 0 &&
            med.current_stock ===
              med.expired_batches.reduce(
                (sum: number, b: any) => sum + b.quantity,
                0
              );

          return {
            ...med,
            //  isExpired: isExpiredByName || allExpired, // ✅ Mark as expired if either condition is true
          };
        });
      });
  }

  initializeForm() {
    this.packagemaster = this.fb.group({
      packagename: ['', Validators.required],
      symptom_group: [[], Validators.required],
      // medicines: [[], Validators.required],
      medicines: this.fb.array([], Validators.required),
      checkbox: this.fb.group({
        morning: [false],
        noon: [false],
        evening: [false],
        night: [false],
      }),
      intake: ['', Validators.required],
      advice: ['', Validators.required],
    });
  }

  loadPackage(packageId: string) {
    this.masterService.getPackages().subscribe(
      (response: any) => {
        const packages = response.pkg || [];
        const pack = packages.find((p: any) => p._id === packageId);

        console.log(
          '🚀 ~ AddpackageComponent ~ this.masterService.getPackages ~ pack:',
          pack
        );

        if (pack) {
          // Extract symptom IDs from the nested symptom_group object
          const symptomGroupIds = Array.isArray(pack.symptom_group?.symptoms)
            ? pack.symptom_group?.symptoms.map((s: any) => s._id)
            : [];

          const symptomGroup = pack.symptom_group?._id;

          console.log(symptomGroup);

          // Extract medicine IDs from medicines array
          const medicineIds = Array.isArray(pack.medicines)
            ? pack.medicines.map((m: any) => m._id)
            : [];

          // console.log('>> Extracted medicine IDs:', medicineIds);

          const medicinesFormArray = this.packagemaster.get(
            'medicines'
          ) as FormArray;
          medicinesFormArray.clear();
          medicineIds.forEach((id: string) => {
            medicinesFormArray.push(new FormControl(id, Validators.required));
          });

          console.log('FormArray after push:', medicinesFormArray.value);

          this.selectedSymptoms = this.symptomGroup.filter((s: any) =>
            symptomGroupIds.includes(s._id)
          );

          this.selectedMedicines = pack.medicines.filter((m: any) =>
            medicineIds.includes(m._id)
          );

          // Patch the form with package data
          this.packagemaster.patchValue({
            packagename: pack.packagename,
            symptom_group: symptomGroup,
            // medicines: medicineIds, // use array of IDs here
            medicines: this.selectedMedicines.map((s) => s._id),
            intake: pack.intake,
            advice: pack.advice,
            checkbox: pack.checkbox,
          });

          // Filter and pre-select symptoms and medicines for your UI controls
          // this.selectedSymptoms = this.symptomGroup.filter((s: any) =>
          //   symptomGroupIds.includes(s._id)
          // );

          // this.selectedMedicines = this.medicines.filter((m: any) =>
          //   medicineIds.includes(m._id)
          // );

          console.log('✅ Form after patching:', this.packagemaster.value);
        } else {
          console.warn('Package not found for ID:', packageId);
        }
      },
      (error) => {
        console.error('Failed to load packages:', error);
      }
    );
  }

  toggleSymptomDropdown() {
    this.dropdownOpenSymptoms = !this.dropdownOpenSymptoms;
  }

  toggleMedicineDropdown() {
    this.dropdownOpenMedicines = !this.dropdownOpenMedicines;
  }

  selectSymptom(symptom: any) {
    if (!this.isSymptomSelected(symptom)) {
      this.selectedSymptoms.push(symptom);
      this.updateSelectedSymptoms();
    }
  }

  removeSymptom(symptom: any) {
    this.selectedSymptoms = this.selectedSymptoms.filter(
      (s) => s._id !== symptom._id
    );
    this.updateSelectedSymptoms();
  }

  updateSelectedSymptoms() {
    const ids = this.selectedSymptoms.map((s) => s._id);
    this.packagemaster.patchValue({ symptom_group: ids });
  }

  isSymptomSelected(symptom: any): boolean {
    return this.selectedSymptoms.some((s) => s._id === symptom._id);
  }

  filterMedicines() {
    const search = this.medicineSearchText.toLowerCase().trim();

    if (search.length < 3) {
      this.filteredMedicines = [];
      return;
    }

    this.filteredMedicines = this.medicines.filter((m) =>
      m.medicine_name.toLowerCase().includes(search)
    );

    console.log(this.filteredMedicines);
  }

  selectMedicine(med: any) {
    const alreadySelected = this.selectedMedicines.some(
      (m) => m.medicine_name === med.medicine_name
    );

    if (!alreadySelected) {
      this.selectedMedicines.push(med);
      this.updateSelectedMedicines();
    }

    this.medicineSearchControl.setValue('');
    this.filteredMedicines = [];
    this.dropdownOpenMedicines = false;
  }

  removeMedicine(medicine: any) {
    this.selectedMedicines = this.selectedMedicines.filter(
      (m) => m._id !== medicine._id
    );
    this.updateSelectedMedicines();
  }

  updateSelectedMedicines() {
    const medicinesFormArray = this.packagemaster.get('medicines') as FormArray;
    medicinesFormArray.clear(); // Clear old selections

    this.selectedMedicines.forEach((med) => {
      medicinesFormArray.push(new FormControl(med._id, Validators.required));
    });

    console.log(this.selectedMedicines);

    console.log('Updated medicines FormArray:', medicinesFormArray.value);
  }

  isMedicineSelected(medicine: any): boolean {
    return this.selectedMedicines.some((m) => m._id === medicine._id);
  }

  async onSubmit() {
    const Swal = (await import('sweetalert2')).default;

    if (this.packagemaster.invalid || this.isSubmitting) {
      this.packagemaster.markAllAsTouched();
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

    this.isSubmitting = true;
    const formValue = this.packagemaster.value;

    console.log(formValue);

    const request$ =
      this.editMode && this.packageId
        ? this.masterService.updatePackages(this.packageId, formValue)
        : this.masterService.postPackages(formValue);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.editMode ? 'Package Updated' : 'Package Created',
          text: `Package has been ${
            this.editMode ? 'updated' : 'created'
          } successfully.`,
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
        this.packagemaster.reset();
        this.router.navigateByUrl('/master/packagemasterlist');
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(
          `Error ${this.editMode ? 'updating' : 'creating'} package:`,
          err
        );
        Swal.fire({
          icon: 'error',
          title: this.editMode ? 'Update Failed' : 'Creation Failed',
          text:
            err.error.message ||
            `Something went wrong while ${
              this.editMode ? 'updating' : 'creating'
            } the package.`,
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button',
          },
        });
        this.isSubmitting = false;
      },
    });
  }

  handleError(error: any, context: string) {
    console.error(`Error on ${context}:`, error);
    const errorMessage =
      error?.error?.message || `Failed to ${context} package.`;
    alert(errorMessage);
  }

  getAllMedicinesMatching(query: string) {
    const pageSize = 20;
    let page = 1;
    let allResults: any[] = [];

    const fetchPage = (): any => {
      return this.masterService
        .getMedicinenyname({ medicine_name: query, page, limit: pageSize })
        .pipe(
          switchMap((res: any) => {
            const data = res.data || [];
            allResults = [...allResults, ...data];

            const totalCount = res.totalCount || 0;
            const morePages = allResults.length < totalCount;

            if (morePages) {
              page++;
              return fetchPage(); // Recursive fetch
            } else {
              return of(allResults);
            }
          })
        );
    };

    return fetchPage();
  }
}
