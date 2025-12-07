import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CustomtimepickerComponent } from '../../component/customtimepicker/customtimepicker.component';
import { CustomcalendarComponent } from '../../component/customcalendar/customcalendar.component';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { DoctorService } from '../../views/doctormodule/doctorservice/doctor.service';
import { IpdService } from '../../views/ipdmodule/ipdservice/ipd.service';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, firstValueFrom, of, startWith, switchMap } from 'rxjs';
import { PharmaService } from '../pharma.service';
import { merge, map } from 'rxjs';
import { IndianCurrencyPipe } from '../../pipe/indian-currency.pipe';
import { ToastrService } from 'ngx-toastr';
import { PharmapartpaymentComponent } from '../pharmapaymentmodule/pharmapartpayment/pharmapartpayment.component';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-pharmaintermbill',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IndianCurrencyPipe,
    PharmapartpaymentComponent
  ],
  templateUrl: './pharmaintermbill.component.html',
  styleUrl: './pharmaintermbill.component.css',
})
export class PharmaintermbillComponent {
  pharmareq: any[] = [];
   pharmainward: FormGroup;
   manuallySelected = false;
   filteredPatients: any[] = [];
   showSuggestions = false;
   selectedPatient: any = null;
   selectedPatientDetails: any = null;
   selectedPackages: any[] = [];
   userId: string = '';
   medicinedata: any[] = [];
   userPermissions: any = {};
   pharmapermission: any = {};
   filteredPharmareq: any[] = [];
   allPharmareq: any[] = [];
   currentPage = 1;
   itemsPerPage = 5;
   totalPages = 1;

   // ✅ NEW: Enhanced Medicine Search Properties
   medicineSearchControl = new FormControl<string>('');
   filteredMedicines: any[] = [];
   alternativeMedicines: any[] = [];
   currentSearchTerm: string = '';
   isSearchingAlternatives: boolean = false;
   expiredMedicineNames: Set<string> = new Set();

   // Stock management properties
   stockData: Map<string, number> = new Map();

   // Reset protection flag
   private isResetting = false;
   private isFormInitializing = false;
  private isUpdating = false;

   constructor(
     private masterService: MasterService,
     private router: Router,
     private fb: FormBuilder,
     private ipdservice: IpdService,
     private doctorservice: DoctorService,
     private pharmaservice: PharmaService,
     private toastr: ToastrService
   ) {
     this.pharmainward = this.fb.group({
       uhid: [''],
       pharmaceuticalRequestId: [''],
       dueAmount: [0],
      //  PaymentMode: ['', Validators.required],
       amountReceived: [0],
       total: [0],
       uniqueHealthIdentificationId: [''],
       patient_name: [''],
       age: [0, [Validators.required, Validators.min(0), Validators.max(150)]],
       inwardSerialNumber: [''],
       dosageInstruction: [''],
       status: ['pending'],
       packages: this.fb.array([]),
       pharmacistUserId: [''],
       transactionId: [''],
       cashAmount: [0, [Validators.min(0)]],
      cardAmount: [0, [Validators.min(0)]],
      upiAmount: [0, [Validators.min(0)]],
     }, { validators: this.paymentSplitValidator })

       this.pharmainward.get('upiAmount')?.valueChanges.subscribe(upiAmount => {
      const transactionIdControl = this.pharmainward.get('transactionId');
      if (upiAmount > 0) {
        transactionIdControl?.setValidators([Validators.required]);
      } else {
        transactionIdControl?.clearValidators();
      }
      transactionIdControl?.updateValueAndValidity();
    });
   }

   ngOnInit(): void {
     this.isFormInitializing = true;

     const userData = localStorage.getItem('authUser');
     if (userData) {
       try {
         const user = JSON.parse(userData);
         this.userId = user?._id || '';
         this.pharmainward.get('pharmacistUserId')?.setValue(this.userId);
       } catch (e) {
         console.error('Error parsing authUser from localStorage:', e);
       }
     }

     // Load permissions
     const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
     const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'pharmaceuticalInward');
     const opdModule = allPermissions.find((perm: any) => perm.moduleName === 'pharmaceuticalRequestList');

     this.userPermissions = uhidModule?.permissions || {};
     this.pharmapermission = opdModule?.permissions?.create === 1;

     // Load pharmacy requests and expired medicines
     this.loadPharmareq();
     this.loadExpiredMedicines();

     // ✅ NEW: Enhanced Medicine Search Implementation
     const pharmacyId: string = '68beb0b38066685ac24f8017';

     this.medicineSearchControl.valueChanges
       .pipe(
         startWith('' as string),
         map((val) => val ?? ''),
         debounceTime(300),
         distinctUntilChanged(),
         switchMap((searchTerm: string) => {
           this.currentSearchTerm = searchTerm;
           const term = searchTerm.trim();

           if (term.length > 1) {
             return this.searchMedicinesWithAlternatives(term);
           } else {
             this.alternativeMedicines = [];
             return of({ primary: [], alternatives: [] });
           }
         })
       )
       .subscribe((result: any) => {
         this.filteredMedicines = result.primary || [];
         if (this.filteredMedicines.length === 0 && result.alternatives) {
           this.alternativeMedicines = result.alternatives;
         } else {
           this.alternativeMedicines = [];
         }
       });

     // Patient name search
     this.pharmainward.get('patient_name')?.valueChanges.pipe(
       debounceTime(300),
       switchMap((name: string) => {
         if (this.manuallySelected || this.isResetting) return of({ res: [] });
         return name && name.length > 2
           ? this.doctorservice.getPatientByName(name)
           : of({ res: [] });
       })
     ).subscribe((res: any) => {
       if (this.manuallySelected || this.isResetting) return;
       this.pharmareq = res.res || res || [];
       this.showSuggestions = this.pharmareq.length > 0;
     });

     // UHID search
     this.pharmainward.get('uhid')?.valueChanges.pipe(
       debounceTime(300),
       switchMap((uhid: string) => {
         if (this.manuallySelected || this.isResetting) return of({ res: [] });
         return uhid && uhid.length > 2
           ? this.doctorservice.getPatientByUhid(uhid)
           : of({ res: [] });
       })
     ).subscribe((res: any) => {
       if (this.manuallySelected || this.isResetting) return;
       this.pharmareq = res.res || res || [];
       this.showSuggestions = this.pharmareq.length > 0;
     });

     // Amount calculations
     this.pharmainward.get('total')?.valueChanges.subscribe(() => {
       if (!this.isResetting) {
         this.roundTotal();
       }
     });

     this.pharmainward.get('amountReceived')?.valueChanges.subscribe(() => {
       if (!this.isResetting) {
         this.updateDueAmount();
       }
     });

     // Payment mode validation
     // Payment mode validation
    this.pharmainward.get('PaymentMode')?.valueChanges.subscribe((value) => {
      if (this.isResetting) return;

      const txnControl = this.pharmainward.get('transactionId');
      if (value === 'upi') {
        txnControl?.setValidators([Validators.required]);
      } else {
        txnControl?.clearValidators();
        txnControl?.setValue('');
      }
      txnControl?.updateValueAndValidity();
    });
     // Load medicine data
     this.masterService.getMedicine().subscribe((res) => {
       this.medicinedata = res.res || res.data || [];
     });

     // Mark initialization complete
     setTimeout(() => {
       this.isFormInitializing = false;
     }, 1000);
   }


    paymentSplitValidator = (group: AbstractControl): ValidationErrors | null => {
    const total = Number(group.get('total')?.value || 0);
    const cash = Number(group.get('cashAmount')?.value || 0);
    const upi = Number(group.get('upiAmount')?.value || 0);
    const card = Number(group.get('cardAmount')?.value || 0);
    const sum = cash + upi + card;
    const transactionId = group.get('transactionId')?.value;
    if (upi > 0 && !transactionId) { return { transactionIdMissing: true }; }
    if (sum !== total) { return { paymentSumMismatch: true }; }
    return null;
  };
  get paymentSumMismatch(): boolean { return !!this.pharmainward.errors?.['paymentSumMismatch']; }
  get transactionIdMissing(): boolean { return !!this.pharmainward.errors?.['transactionIdMissing']; }



   // ✅ NEW: Load expired medicines
   loadExpiredMedicines(): void {
     const pharmacyId = '68beb0b38066685ac24f8017';
     this.masterService.getSubPharmacyExpiredStock(pharmacyId).subscribe({
       next: (res: any) => {
         const expireproducts = res.data || [];
         this.expiredMedicineNames = new Set(
           expireproducts.map((item: any) => item.medicine.medicine_name)
         );
       },
       error: (err) => {
         console.log('Error fetching expired medicines:', err);
       },
     });
   }

   // ✅ NEW: Enhanced medicine search with alternatives
   searchMedicinesWithAlternatives(searchTerm: string) {
     const pharmacyId: string = '68beb0b38066685ac24f8017';

     return this.masterService.getSubPharmacyInventoryItems(pharmacyId, 1, 10, searchTerm)
       .pipe(
         switchMap((res: any) => {
           const primaryResults = res?.data || [];

           // Process primary results
           const processedPrimary = primaryResults.map((med: any) => {
             const isExpiredByName = this.expiredMedicineNames.has(med.medicine_name);
             const allExpired = med.expired_batches?.length > 0 &&
               med.current_stock === med.expired_batches.reduce((sum: number, b: any) => sum + b.quantity, 0);

             return {
               ...med,
               isExpired: isExpiredByName || allExpired,
             };
           });

           // If primary results exist and have available stock, return them
           const availablePrimary = processedPrimary.filter((med: any) =>
             !med.isExpired && med.current_stock > 0
           );

           if (availablePrimary.length > 0) {
             return of({
               primary: processedPrimary,
               alternatives: []
             });
           }

           // If no primary results or all out of stock, search for alternatives
           return this.searchAlternativeMedicines(searchTerm).pipe(
             map((alternatives: any[]) => ({
               primary: processedPrimary,
               alternatives: alternatives
             }))
           );
         })
       );
   }

   // ✅ NEW: Search for alternative medicines using multiple strategies
   searchAlternativeMedicines(originalTerm: string) {
     const pharmacyId: string = '68beb0b38066685ac24f8017';
     const searchStrategies = this.generateSearchStrategies(originalTerm);

     // Search using multiple strategies
     const searchRequests = searchStrategies.map(strategy =>
       this.masterService.getSubPharmacyInventoryItems(pharmacyId, 1, 20, strategy)
         .pipe(
           map((res: any) => (res?.data || []).map((med: any) => ({
             ...med,
             searchStrategy: strategy,
             isAlternative: true,
             isExpired: this.expiredMedicineNames.has(med.medicine_name)
           }))),
           catchError(() => of([]))
         )
     );

     return combineLatest(searchRequests).pipe(
       map((results: any[][]) => {
         // Combine and deduplicate results
         const combined = results.flat();
         const unique = this.deduplicateMedicines(combined);

         // Filter available alternatives
         return unique.filter((med: any) =>
           !med.isExpired &&
           med.current_stock > 0 &&
           !med.medicine_name.toLowerCase().includes(originalTerm.toLowerCase())
         ).slice(0, 10); // Limit to 10 alternatives
       })
     );
   }

   // ✅ NEW: Generate search strategies for finding alternatives
   generateSearchStrategies(originalTerm: string): string[] {
     const strategies: string[] = [];
     const term = originalTerm.toLowerCase().trim();

     // Strategy 1: Generic name variations
     const commonGenericMappings: { [key: string]: string[] } = {
       'paracetamol': ['acetaminophen', 'tylenol', 'calpol', 'dolo', 'metacin'],
       'ibuprofen': ['brufen', 'advil', 'combiflam', 'ibugesic'],
       'omeprazole': ['prilosec', 'omez', 'pantoprazole', 'rabeprazole'],
       'metformin': ['glucophage', 'glycomet', 'diabex', 'glyciphage'],
       'amlodipine': ['norvasc', 'amlopres', 'stamlo', 'amlokind'],
       'atorvastatin': ['lipitor', 'atorva', 'storvas', 'atocor'],
       'ciprofloxacin': ['cipro', 'ciplox', 'cifran', 'ciproxin'],
       'azithromycin': ['zithromax', 'azax', 'azee', 'azithral'],
       'diclofenac': ['voveran', 'voltaren', 'diclo', 'diclomol'],
       'cetirizine': ['zyrtec', 'cetriz', 'alerid', 'okacet']
     };

     // Add generic alternatives
     Object.entries(commonGenericMappings).forEach(([generic, brands]) => {
       if (term.includes(generic)) {
         strategies.push(...brands);
       } else if (brands.some(brand => term.includes(brand))) {
         strategies.push(generic);
         strategies.push(...brands.filter(b => !term.includes(b)));
       }
     });

     // Strategy 2: Partial word matching
     if (term.length > 4) {
       strategies.push(term.substring(0, Math.floor(term.length * 0.7)));
       strategies.push(term.substring(0, Math.floor(term.length * 0.5)));
     }

     // Strategy 3: Common medicine categories
     const categoryMappings: { [key: string]: string[] } = {
       'pain': ['paracetamol', 'ibuprofen', 'diclofenac', 'aspirin', 'tramadol'],
       'fever': ['paracetamol', 'ibuprofen', 'mefenamic', 'aspirin'],
       'cold': ['cetirizine', 'phenylephrine', 'dextromethorphan', 'chlorpheniramine'],
       'cough': ['dextromethorphan', 'bromhexine', 'ambroxol', 'guaifenesin'],
       'acidity': ['omeprazole', 'pantoprazole', 'ranitidine', 'famotidine'],
       'diabetes': ['metformin', 'glimepiride', 'insulin', 'gliclazide'],
       'pressure': ['amlodipine', 'atenolol', 'losartan', 'ramipril'],
       'antibiotic': ['amoxicillin', 'azithromycin', 'ciprofloxacin', 'cephalexin']
     };

     // Add category-based alternatives
     Object.entries(categoryMappings).forEach(([category, medicines]) => {
       if (term.includes(category)) {
         strategies.push(...medicines);
       }
     });

     // Strategy 4: Common prefixes/suffixes
     if (term.endsWith('mycin')) {
       strategies.push('azithromycin', 'erythromycin', 'clarithromycin', 'streptomycin');
     }
     if (term.endsWith('cillin')) {
       strategies.push('amoxicillin', 'ampicillin', 'penicillin', 'cloxacillin');
     }
     if (term.endsWith('floxacin')) {
       strategies.push('ciprofloxacin', 'ofloxacin', 'levofloxacin', 'norfloxacin');
     }

     return [...new Set(strategies)]; // Remove duplicates
   }

   // ✅ NEW: Remove duplicate medicines from search results
   deduplicateMedicines(medicines: any[]): any[] {
     const seen = new Set<string>();
     return medicines.filter(med => {
       const key = med.medicine_name.toLowerCase();
       if (seen.has(key)) {
         return false;
       }
       seen.add(key);
       return true;
     });
   }

   // ✅ NEW: Manual search for alternatives button
   async searchAlternatives(searchTerm: string): Promise<void> {
     if (!searchTerm || searchTerm.length < 2) return;

     this.isSearchingAlternatives = true;

     try {
       const alternatives = await firstValueFrom(this.searchAlternativeMedicines(searchTerm));
       this.alternativeMedicines = alternatives;

       if (alternatives.length === 0) {
         this.toastr.info(
           `No alternative medicines found for "${searchTerm}". Try searching with generic name or consult with doctor.`,
           'No Alternatives Found'
         );
       } else {
         this.toastr.success(
           `Found ${alternatives.length} alternative medicine(s) for "${searchTerm}"`,
           'Alternatives Found'
         );
       }
     } catch (error) {
       console.error('Error searching alternatives:', error);
       this.toastr.error('Failed to search for alternative medicines', 'Search Error');
     } finally {
       this.isSearchingAlternatives = false;
     }
   }

   // ✅ NEW: Add medicine to packages from search results
   async addMedicineToPackages(med: any): Promise<void> {
     if (med.current_stock === 0 || med.isExpired) {
       this.toastr.error('This medicine is currently out of stock or expired.', 'Unavailable Medicine');
       return;
     }

     // Check if medicine already exists in packages
     const existingMedicine = this.packagesFormArray.controls.find(
       (ctrl) => ctrl.get('medicineName')?.value === med.medicine_name
     );

     if (existingMedicine) {
       this.toastr.warning(`${med.medicine_name} is already in the prescription list.`, 'Duplicate Medicine');
       return;
     }

     const price = med.medicine?.price ?? 0;

     const medicineGroup = this.createPackageGroup({
       medicineName: med.medicine_name,
       quantity: 1,
       charge: price,
       dosageInstruction: '',
       availableStock: med.current_stock,
       checkbox: {
         morning: false,
         noon: false,
         evening: false,
         night: false,
       },
       isAlternative: false
     });

     this.packagesFormArray.push(medicineGroup);
     this.calculateTotal();

     this.medicineSearchControl.setValue('');
     this.filteredMedicines = [];
     this.alternativeMedicines = [];

     this.toastr.success(`${med.medicine_name} added to prescription.`, 'Medicine Added');
   }

   // ✅ NEW: Add alternative medicine with confirmation
   async addAlternativeMedicine(med: any): Promise<void> {
     const Swal = (await import('sweetalert2')).default;

     const result = await Swal.fire({
       title: 'Add Alternative Medicine',
       html: `
         <div class="text-start">
           <p><strong>Alternative:</strong> ${med.medicine_name}</p>
           <p><strong>Original Search:</strong> ${this.currentSearchTerm}</p>
           <p><strong>Price:</strong> ₹${med?.medicine?.price || 0}</p>
           <p><strong>Available Stock:</strong> ${med.current_stock} units</p>
           ${med?.medicine?.generic_name ? `<p><strong>Generic:</strong> ${med.medicine.generic_name}</p>` : ''}
           <hr>
           <p class="text-warning small"><i class="fa-solid fa-exclamation-triangle"></i> Please verify with doctor before substituting medicines.</p>
         </div>
       `,
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#ffc107',
       cancelButtonColor: '#6c757d',
       confirmButtonText: 'Add Alternative',
       cancelButtonText: 'Cancel'
     });

     if (result.isConfirmed) {
       // Check if medicine already exists in packages
       const existingMedicine = this.packagesFormArray.controls.find(
         (ctrl) => ctrl.get('medicineName')?.value === med.medicine_name
       );

       if (existingMedicine) {
         this.toastr.warning(`${med.medicine_name} is already in the prescription list.`, 'Duplicate Medicine');
         return;
       }

       const price = med.medicine?.price ?? 0;

       const medicineGroup = this.createPackageGroup({
         medicineName: med.medicine_name,
         quantity: 1,
         charge: price,
         dosageInstruction: '',
         availableStock: med.current_stock,
         checkbox: {
           morning: false,
           noon: false,
           evening: false,
           night: false,
         },
         isAlternative: true
       });

       this.packagesFormArray.push(medicineGroup);
       this.calculateTotal();

       this.medicineSearchControl.setValue('');
       this.filteredMedicines = [];
       this.alternativeMedicines = [];

       this.toastr.warning(
         `Alternative medicine "${med.medicine_name}" added. Please confirm with doctor.`,
         'Alternative Added'
       );
     }
   }

   get packagesFormArray(): FormArray {
     return this.pharmainward.get('packages') as FormArray;
   }

   get paginatedPharmareq(): any[] {
     const start = (this.currentPage - 1) * this.itemsPerPage;
     const end = start + this.itemsPerPage;
     return this.filteredPharmareq.slice(start, end);
   }

   // Add this method to your PharmaintermbillComponent class
getBedNumber(item: any): string | null {
  try {
    // Primary path: Check inpatientCaseDetails.bed.bed_number
    if (item.inpatientCaseDetails?.bed?.bed_number) {
      return item.inpatientCaseDetails.bed.bed_number;
    }

    // Alternative path: Check if bed info is in request object
    if (item.request?.inpatientCaseDetails?.bed?.bed_number) {
      return item.request.inpatientCaseDetails.bed.bed_number;
    }

    // Fallback: Direct bed property
    if (item.bed?.bed_number) {
      return item.bed.bed_number;
    }

    // Alternative bed number field name
    if (item.bed?.bednumber) {
      return item.bed.bednumber;
    }

    return null;
  } catch (error) {
    console.warn('Error extracting bed number:', error);
    return null;
  }
}

   async loadStockData(): Promise<void> {
     if (this.isResetting) return;

     const pharmacyId: string = '68beb0b38066685ac24f8017';

     try {
       for (const group of this.packagesFormArray.controls) {
         const medicineName = group.get('medicineName')?.value;
         if (!medicineName) continue;

         const res: any = await firstValueFrom(
           this.masterService.getSubPharmacyInventoryItems(pharmacyId, 1, 10, medicineName)
         );

         const inventoryItem = res?.data?.[0];
         if (inventoryItem) {
           this.stockData.set(medicineName, inventoryItem.current_stock || 0);
           // Update the form control with available stock
           group.get('availableStock')?.setValue(inventoryItem.current_stock || 0);
         }
       }
     } catch (err) {
       console.error('Error loading stock data:', err);
     }
   }

   private createPackageGroup(pkg: any): FormGroup {
     const packageGroup = this.fb.group({
       medicineName: [pkg.medicineName || ''],
       quantity: [pkg.quantity || 1, [Validators.required, Validators.min(1)]],
       charge: [pkg.charge || 0],
       dosageInstruction: [pkg.dosageInstruction || ''],
       availableStock: [pkg.availableStock || 0],
       isAlternative: [pkg.isAlternative || false], // ✅ NEW: Track if medicine is alternative
       checkbox: this.fb.group({
         morning: [pkg.checkbox?.morning || false],
         noon: [pkg.checkbox?.noon || false],
         evening: [pkg.checkbox?.evening || false],
         night: [pkg.checkbox?.night || false],
       }),
       remarks: [pkg.remarks || ''],
     });

     // Add validation with protection against reset and initialization
     packageGroup.get('quantity')?.valueChanges.subscribe(() => {
       if (!this.isResetting && !this.isFormInitializing) {
         // Add small delay to ensure form is stable
         setTimeout(() => {
           if (!this.isResetting && !this.isFormInitializing) {
             this.validateQuantityAndCalculateTotal();
           }
         }, 100);
       }
     });

     return packageGroup;
   }

   selectPatient(patient: any): void {
     if (!patient) return;

     this.isResetting = true;
     this.manuallySelected = true;
     this.selectedPatient = patient;
     this.selectedPatientDetails = patient;
     this.showSuggestions = false;

     const pendingRequest = patient.pharmaceuticalrequestlists?.find(
       (req: any) => req.status === 'pending' && req.patientType === 'inpatientDepartment'
     );

     if (!pendingRequest) {
       this.toastr.warning('No pending pharmaceutical request found for this patient.');
       this.isResetting = false;
       return;
     }

     this.selectedPackages = pendingRequest.packages || [];
     this.packagesFormArray.clear();

     // Add packages using the protected method
     this.selectedPackages.forEach((pkg) => {
       const packageGroup = this.createPackageGroup(pkg);
       this.packagesFormArray.push(packageGroup);
     });

     // Extract numeric age
     const extractedAge = this.extractNumericAge(patient.age);

     // Patch patient details
     this.pharmainward.patchValue({
       patient_name: patient.patient_name,
       uhid: patient.uhid,
       age: extractedAge,
       uniqueHealthIdentificationId: pendingRequest?.uniqueHealthIdentificationId || '',
       status: pendingRequest?.status || 'pending',
       pharmaceuticalRequestId: pendingRequest?._id || '',
     });

     // Clear reset flag before loading stock data
     this.isResetting = false;

     // Load stock data and calculate total
     this.loadStockData().then(() => {
       this.calculateTotal();
     });
   }

   private extractNumericAge(age: any): number {
     if (!age) return 0;

     // If already a number, return it
     if (typeof age === 'number') {
       return age;
     }

     // Convert to string for processing
     const ageStr = age.toString();

     // Handle formats like "25Y 8M 10D", "25y 5m 29d", or just "25"
     const yearMatch = ageStr.match(/(\d+)(?:Y|y|years?|Years?)/i);
     if (yearMatch) {
       return parseInt(yearMatch[1], 10);
     }

     // Handle simple numeric strings
     const numericMatch = ageStr.match(/^\d+$/);
     if (numericMatch) {
       return parseInt(ageStr, 10);
     }

     // Extract first number found
     const firstNumber = ageStr.match(/\d+/);
     if (firstNumber) {
       return parseInt(firstNumber[0], 10);
     }

     return 0; // Default fallback
   }

   checkQuantity(index: number): void {
     // Skip validation if form is being reset or initializing
     if (this.isResetting || this.isFormInitializing) return;

     const row = this.packagesFormArray.at(index);
     if (!row) return;

     const enteredQty = Number(row.get('quantity')?.value) || 0;
     const available = Number(row.get('availableStock')?.value) || 0;
     const medicineName = row.get('medicineName')?.value;

     // Skip validation for empty or invalid data
     if (!medicineName || enteredQty <= 0) return;

     if (available > 0 && enteredQty > available) {
       row.get('quantity')?.setValue(available, { emitEvent: false });
       this.toastr.warning(
         `Only ${available} units of ${medicineName} are available in stock.`,
         'Stock Limit Exceeded'
       );
     }

     if (enteredQty < 1) {
       row.get('quantity')?.setValue(1, { emitEvent: false });
       this.toastr.info('Minimum quantity is 1.', 'Invalid Quantity');
     }

     this.calculateTotal();
   }

   validateQuantityAndCalculateTotal(): void {
     // Skip validation if form is being reset or initializing
     if (this.isResetting || this.isFormInitializing || this.packagesFormArray.length === 0) return;

     this.packagesFormArray.controls.forEach((group, index) => {
       // Only validate if the control has meaningful data
       const medicineName = group.get('medicineName')?.value;
       const quantity = group.get('quantity')?.value;

       if (medicineName && quantity && quantity > 0) {
         this.checkQuantity(index);
       }
     });
   }

   calculateTotal(): void {
     // Skip calculation if form is being reset
     if (this.isResetting) return;

     let total = 0;
     this.packagesFormArray.controls.forEach((group: AbstractControl) => {
       const quantity = Number(group.get('quantity')?.value || 0);
       const charge = Number(group.get('charge')?.value || 0);

       // Only add to total if both values are valid
       if (quantity > 0 && charge > 0) {
         total += quantity * charge;
       }
     });

     this.pharmainward.get('total')?.setValue(Math.round(total), { emitEvent: false });
     this.updateDueAmount();
   }

   roundTotal(): void {
     if (this.isResetting) return;

     const totalControl = this.pharmainward.get('total');
     const value = totalControl?.value;

     if (value !== null && value !== undefined) {
       const roundedValue = Math.round(value);
       totalControl?.setValue(roundedValue, { emitEvent: false });
       this.updateDueAmount();
     }
   }

   updateDueAmount(): void {
     if (this.isResetting) return;

     const total = this.pharmainward.get('total')?.value || 0;
     const amountReceived = this.pharmainward.get('amountReceived')?.value || 0;
     const dueAmount = total - amountReceived;

     this.pharmainward.get('dueAmount')?.setValue(dueAmount, { emitEvent: false });
   }

   onPatientInput(): void {
     const value = this.pharmainward.get('patient_name')?.value?.trim();

     if (this.manuallySelected && this.selectedPatientDetails?.patient_name === value) {
       this.showSuggestions = false;
       return;
     }

     if (!value || value.length <= 2) {
       this.manuallySelected = false;
       this.selectedPatientDetails = null;
       this.pharmareq = [];
       this.showSuggestions = false;
       return;
     }

     if (!this.manuallySelected && this.pharmareq.length > 0) {
       this.showSuggestions = true;
     }
   }

   onUHidInput(): void {
     const value = this.pharmainward.get('uhid')?.value?.trim();

     if (this.manuallySelected && this.selectedPatientDetails?.uhid === value) {
       this.showSuggestions = false;
       return;
     }

     if (!value || value.length <= 2) {
       this.manuallySelected = false;
       this.selectedPatientDetails = null;
       this.pharmareq = [];
       this.showSuggestions = false;
       return;
     }

     if (!this.manuallySelected && this.pharmareq.length > 0) {
       this.showSuggestions = true;
     }
   }

   hideSuggestionsWithDelay(): void {
     setTimeout(() => {
       this.showSuggestions = false;
     }, 200);
   }

   loadPharmareq(): void {
     this.doctorservice.getPharmareq(1, 1000).subscribe((res) => {
       const flattened: any[] = [];

       res.forEach((patient: any) => {
         patient.pharmaceuticalrequestlists.forEach((req: any) => {
           if (req.status === 'pending' && req.patientType === 'inpatientDepartment') {
             flattened.push({
               patient_name: patient.patient_name,
               uhid: patient.uhid,
               age: patient.age,
               patientType: req.patientType,
               status: req.status,
               packages: req.packages,
               request: req,
               pharmaceuticalRequestId: req._id,
               uniqueHealthIdentificationId: req.uniqueHealthIdentificationId
             });
           }
         });
       });

       this.allPharmareq = flattened;
       this.applyFilter();
       this.currentPage = 1;
       this.totalPages = Math.ceil(this.filteredPharmareq.length / this.itemsPerPage);
     });
   }

   applyFilter(): void {
     this.filteredPharmareq = this.allPharmareq.filter((req) => {
       return req.status === 'pending';
     });

     this.totalPages = Math.ceil(this.filteredPharmareq.length / this.itemsPerPage);
   }

   pickPatient(item: any): void {
     // Set reset flag before clearing
     this.isResetting = true;
     this.packagesFormArray.clear();

     // Extract numeric age
     const extractedAge = this.extractNumericAge(item.age);

     // Patch basic patient details
     this.pharmainward.patchValue({
       patient_name: item.patient_name,
       uhid: item.uhid,
       age: extractedAge,
       status: item.status || 'pending',
       pharmaceuticalRequestId: item.pharmaceuticalRequestId || item.request?._id,
       uniqueHealthIdentificationId: item.uniqueHealthIdentificationId
     });

     // Add packages dynamically with stock validation
     if (item.packages && item.packages.length > 0) {
       item.packages.forEach((pkg: any) => {
         const packageGroup = this.createPackageGroup(pkg);
         this.packagesFormArray.push(packageGroup);
       });

       // Clear reset flag before loading stock data
       this.isResetting = false;

       // Load stock data and calculate total
       this.loadStockData().then(() => {
         this.calculateTotal();
       });
     } else {
       this.isResetting = false;
     }

     this.manuallySelected = true;
   }

   nextPage(): void {
     if (this.currentPage < this.totalPages) {
       this.currentPage++;
     }
   }

   previousPage(): void {
     if (this.currentPage > 1) {
       this.currentPage--;
     }
   }

   async onSubmit(): Promise<void> {
     const Swal = (await import('sweetalert2')).default;

     if (this.pharmainward.invalid) {
       this.pharmainward.markAllAsTouched();
       this.toastr.error('Please fill all required fields correctly', 'Form Validation Error');
       return;
     }

     const formData = this.pharmainward.value;
     const requestId = formData.pharmaceuticalRequestId;

     if (!requestId) {
       this.showError('Missing Request', 'Pharmaceutical request ID is missing.');
       return;
     }

     const payload = {
       uhid: formData.uhid,
       patient_name: formData.patient_name,
       age: formData.age,
       status: formData.status,
       total: Number(formData.total),
       cashAmount: formData.cashAmount,
      cardAmount: formData.cardAmount,
      upiAmount: formData.upiAmount,
       transactionId: formData.transactionId,
       pharmaceuticalRequestId: requestId,
       packages: formData.packages,
       uniqueHealthIdentificationId: formData.uniqueHealthIdentificationId,
       pharmacistUserId: formData.pharmacistUserId || this.userId,
       type: 'inpatientDepartment',
     };

     const pharmacyId: string = '68beb0b38066685ac24f8017';

     try {
       // Step 1: Create inward pharma entry
       await firstValueFrom(this.pharmaservice.postPharmareq(payload));

       // Step 2: Mark pharma request completed
       await firstValueFrom(
         this.doctorservice.updatePharmareq(requestId, { status: 'completed' })
       );

       // Step 3: Update stock in sub-pharmacy
       for (const group of this.packagesFormArray.controls) {
         const medicineName = group.get('medicineName')?.value;
         const quantityDispensed = Number(group.get('quantity')?.value);

         if (!medicineName || !quantityDispensed) continue;

         try {
           const res: any = await firstValueFrom(
             this.masterService.getSubPharmacyInventoryItems(pharmacyId, 1, 10, medicineName)
           );

           const inventoryItem = res?.data?.[0];
           if (!inventoryItem) {
             console.warn(`⚠️ Inventory item not found: ${medicineName}`);
             continue;
           }

           const oldStock = inventoryItem.current_stock || 0;
           const adjustment = -quantityDispensed;

           if (oldStock + adjustment < 0) {
             console.warn(`⚠️ Cannot dispense ${quantityDispensed}, only ${oldStock} in stock`);
             continue;
           }

           await firstValueFrom(
             this.masterService.updateInventoryItem(inventoryItem._id, {
               adjustment,
               reason: 'dispense_to_patient',
             })
           );
         } catch (err) {
           console.error(`❌ Error updating stock for ${medicineName}`, err);
         }
       }

       // Step 4: Success notification
       Swal.fire({
         icon: 'success',
         title: 'Pharmacy Entry Submitted',
         text: 'Pharmaceutical request completed and stock updated successfully.',
         position: 'top-end',
         toast: true,
         timer: 3000,
         showConfirmButton: false,
       });

       // FIXED: Set reset flag before clearing form
       this.isResetting = true;

       // Reset form and reload data
       this.loadPharmareq();
       this.pharmainward.reset();
       this.packagesFormArray.clear();
       this.manuallySelected = false;
       this.stockData.clear();

       // ✅ NEW: Clear search data
       this.medicineSearchControl.setValue('');
       this.filteredMedicines = [];
       this.alternativeMedicines = [];
       this.currentSearchTerm = '';

       // Clear reset flag after reset is complete
       setTimeout(() => {
         this.isResetting = false;
       }, 500);

       this.router.navigateByUrl('/pharmalayout/pharmalayout');

     } catch (err: any) {
       console.error('❌ Submission error:', err);
       this.showError(
         'Submission Failed',
         err?.error?.message || 'Could not complete pharmacy entry.'
       );
     }
   }

   private async showError(title: string, text: string): Promise<void> {
     const Swal = (await import('sweetalert2')).default;
     Swal.fire({
       icon: 'error',
       title: title,
       text: text,
       customClass: {
         popup: 'hospital-swal-popup',
         title: 'hospital-swal-title',
         htmlContainer: 'hospital-swal-text',
         confirmButton: 'hospital-swal-button',
       },
     });
   }

   async removeMedicine(index: number): Promise<void> {
     if (this.isResetting || index < 0 || index >= this.packagesFormArray.length) {
       return;
     }

     const Swal = (await import('sweetalert2')).default;
     const medicineGroup = this.packagesFormArray.at(index);
     const medicineName = medicineGroup.get('medicineName')?.value;

     // Confirmation dialog
     const result = await Swal.fire({
       title: 'Remove Medicine?',
       text: `Are you sure you want to remove "${medicineName}" from the prescription?`,
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#dc3545',
       cancelButtonColor: '#6c757d',
       confirmButtonText: 'Yes, Remove',
       cancelButtonText: 'Cancel'
     });

     if (!result.isConfirmed) {
       return;
     }

     try {
       // Set reset flag to prevent unwanted validations during removal
       this.isResetting = true;

       // Remove from stock tracking
       if (medicineName) {
         this.stockData.delete(medicineName);
       }

       // Remove from FormArray
       this.packagesFormArray.removeAt(index);

       // Show success message
       this.toastr.success(
         `${medicineName} removed from prescription`,
         'Medicine Removed'
       );

       // Clear reset flag
       this.isResetting = false;

       // Recalculate total after removal
       this.calculateTotal();

       // Check if no medicines remain and show info message
       if (this.packagesFormArray.length === 0) {
         this.toastr.info(
           'All medicines removed. Please select a patient to add medicines.',
           'No Medicines'
         );
       }

     } catch (error) {
       this.isResetting = false;
       this.toastr.error(
         'Failed to remove medicine. Please try again.',
         'Removal Error'
       );
       console.error('Error removing medicine:', error);
     }
   }



   onPaymentChange(updatedPayment: any) {
    if (this.isUpdating) return;
    this.isUpdating = true;
    this.pharmainward.patchValue({
      cashAmount: updatedPayment.cashAmount || 0,
      upiAmount: updatedPayment.upiAmount || 0,
      cardAmount: updatedPayment.cardAmount || 0,
      amount_received:
        (updatedPayment.cashAmount || 0) +
        (updatedPayment.upiAmount || 0) +
        (updatedPayment.cardAmount || 0),
      transactionId: updatedPayment.transactionId || '',
      discount: updatedPayment.discount || 0,
      reason: updatedPayment.reason || '',
    });
    this.isUpdating = false;
  }
}
