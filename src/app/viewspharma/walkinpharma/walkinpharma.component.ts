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
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, firstValueFrom, of, switchMap } from 'rxjs';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { MasterService } from '../../views/mastermodule/masterservice/master.service';
import { DoctorService } from '../../views/doctormodule/doctorservice/doctor.service';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { OpdService } from '../../views/opdmodule/opdservice/opd.service';
import { PharmaService } from '../pharma.service';
import { ToastrService } from 'ngx-toastr';
import { IndianCurrencyPipe } from '../../pipe/indian-currency.pipe';
import { PharmapartpaymentComponent } from '../pharmapaymentmodule/pharmapartpayment/pharmapartpayment.component';

@Component({
  selector: 'app-walkinpharma',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IndianCurrencyPipe,
    PharmapartpaymentComponent
  ],
  templateUrl: './walkinpharma.component.html',
  styleUrl: './walkinpharma.component.css',
})
export class WalkinpharmaComponent {
  pharmareq: FormGroup;
  medicineSearchControl = new FormControl<string>('');
  walkInSearchControl = new FormControl<string>('');
  filteredPatients: any[] = [];
  showSuggestions = false;
  filteredWalkInPatients: any[] = [];
  showWalkInSuggestions = false;
  allWalkInPatients: any[] = [];
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  filteredMedicines: any[] = [];
  stockWarning: boolean = false;
  userPermissions: any = {};
  pharmapermission: any = {};
  ipdpharmapermission: any = {};
  userId: string = '';
  expireproducts: any[] = [];
  expiredMedicineNames: Set<string> = new Set();
  manuallySelected = false;
  medicines: any[] = [];
  selectedPatient: any = null;
  selectedPatientDetails: any = null;
  editMode: boolean = false;
  showUHIDDropdown: boolean = false;
  private isUpdating = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private masterservice: MasterService,
    private doctorservice: DoctorService,
    private uhidService: UhidService,
    private opdservce: OpdService,
    private pharmaservice: PharmaService,
    private toastr: ToastrService
  ) {
    this.pharmareq = this.fb.group({
      uniqueHealthIdentificationId: [''],
      patientType: ['outpatientDepartment'],
      patient_name: [''],
      charge: [0],
      additionalRemarks: [''],
      pharmacistUserId: [''],
      status: ['pending'],
      quantity: [0],
      total: [0, Validators.required],
      medicinesArray: this.fb.array([]),
      medicine_name: [''],
      searchTerm: [''],
      cashAmount: [0, [Validators.min(0)]],
      cardAmount: [0, [Validators.min(0)]],
      upiAmount: [0, [Validators.min(0)]],
      transactionId: [''],
      packages: this.fb.array([]),
      walkInPatient: this.fb.group({
        name: ['', Validators.required],
        age: ['', [Validators.required, Validators.min(1), Validators.max(150)]],
        gender: ['', Validators.required],
        mobile_no: ['', [Validators.required, Validators.pattern('[6-9][0-9]{9}')]],
        doctor_name: [''],
      }),
    }, { validators: this.paymentSplitValidator });

    this.pharmareq.get('upiAmount')?.valueChanges.subscribe(upiAmount => {
      const transactionIdControl = this.pharmareq.get('transactionId');
      if (upiAmount > 0) {
        transactionIdControl?.setValidators([Validators.required]);
      } else {
        transactionIdControl?.clearValidators();
      }
      transactionIdControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('authUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user?._id || '';
      } catch (e) {
        console.error('Error parsing authUser from localStorage:', e);
      }
    }
    const allPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const uhidModule = allPermissions.find((perm: any) => perm.moduleName === 'pharmaceuticalRequestList');
    const ipdModule = allPermissions.find((perm: any) => perm.moduleName === 'ipdpharmaceuticalRequestList');
    const pharmainwardModule = allPermissions.find((perm: any) => perm.moduleName === 'pharmaceuticalInward');
    this.userPermissions = pharmainwardModule?.permissions || {};
    this.pharmapermission = uhidModule?.permissions?.create === 1;
    this.ipdpharmapermission = ipdModule?.permissions?.create === 1;
    this.expiredmedicine();
    this.loadAllWalkInPatients();
    const pharmacyId: string = '68beb0b38066685ac24f8017';
    this.medicineSearchControl.valueChanges
      .pipe(
        startWith('' as string),
        map((val) => val ?? ''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm: string) => {
          const term = searchTerm.trim();
          if (term.length > 1) {
            return this.masterservice.getSubPharmacyInventoryItems(pharmacyId, 1, 10, term);
          } else {
            return of({ data: [] });
          }
        })
      )
      .subscribe((res: any) => {
        const rawMedicines = res?.data || [];
        this.filteredMedicines = rawMedicines.map((med: any) => {
          const isExpiredByName = this.expiredMedicineNames.has(med.medicine_name);
          const allExpired = med.expired_batches?.length > 0 &&
            med.current_stock === med.expired_batches.reduce((sum: number, b: any) => sum + b.quantity, 0);
          return { ...med, isExpired: isExpiredByName || allExpired };
        });
      });
    this.walkInSearchControl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => value || ''),
      debounceTime(300), distinctUntilChanged(),
      map((searchTerm: string) => this.filterWalkInPatients(searchTerm))
    ).subscribe((filtered: any[]) => {
      this.filteredWalkInPatients = filtered;
      this.showWalkInSuggestions = filtered.length > 0 && (this.walkInSearchControl.value?.length || 0) > 1;
    });
    this.pharmareq.get('total')?.valueChanges.subscribe(() => { this.roundTotal(); });
    this.medicinesArray.controls.forEach((group: AbstractControl) => {
      group.get('quantity')?.valueChanges.subscribe(() => this.roundTotal());
      group.get('charge')?.valueChanges.subscribe(() => this.roundTotal());
    });
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
  get paymentSumMismatch(): boolean { return !!this.pharmareq.errors?.['paymentSumMismatch']; }
  get transactionIdMissing(): boolean { return !!this.pharmareq.errors?.['transactionIdMissing']; }

  loadAllWalkInPatients(): void {
    this.pharmaservice.getPharmareq().subscribe({
      next: (res) => {
        if (!Array.isArray(res)) { return; }
        this.allWalkInPatients = res.filter((item: any) => item.type === 'outpatientDepartment' && item.isWalkIn === true);
      },
      error: (err) => {
      }
    });
  }
  filterWalkInPatients(searchTerm: string): any[] {
    if (!searchTerm || searchTerm.length < 2) { return []; }
    const term = searchTerm.toLowerCase().trim();
    return this.allWalkInPatients.filter((patient: any) => {
      const name = patient.walkInPatient?.name?.toLowerCase() || '';
      const phone = patient.walkInPatient?.mobile_no || '';
      return name.includes(term) || phone.includes(term);
    });
  }
  selectWalkInPatient(patient: any): void {
    const walkInData = patient.walkInPatient;
    this.pharmareq.get('walkInPatient')?.patchValue({
      name: walkInData.name,
      age: walkInData.age,
      gender: walkInData.gender,
      mobile_no: walkInData.mobile_no,
      doctor_name: walkInData.doctor_name
    });
    this.walkInSearchControl.setValue('');
    this.showWalkInSuggestions = false;
    this.filteredWalkInPatients = [];
    this.toastr.success(`Patient ${walkInData.name} selected`, 'Patient Selected');
  }
  hideWalkInSuggestionsWithDelay(): void { setTimeout(() => { this.showWalkInSuggestions = false; }, 200); }
  expiredmedicine() {
    const pharmacyId = '68beb0b38066685ac24f8017';
    this.masterservice.getSubPharmacyExpiredStock(pharmacyId).subscribe({
      next: (res: any) => {
        this.expireproducts = res.data || [];
        this.expiredMedicineNames = new Set(this.expireproducts.map((item: any) => item.medicine.medicine_name));
      },
      error: (err) => {
      },
    });
  }
  roundTotal(): void {
    let total = 0;
    this.medicinesArray.controls.forEach((group: AbstractControl) => {
      const quantity = Number(group.get('quantity')?.value || 0);
      const charge = Number(group.get('charge')?.value || 0);
      total += quantity * charge;
    });
    const roundedTotal = Math.round(total);
    this.pharmareq.get('total')?.setValue(roundedTotal);
  }
  selectMedicine(med: any) {
    if (med.current_stock === 0) {
      this.stockWarning = true;
      setTimeout(() => (this.stockWarning = false), 3000);
      this.toastr.error('This medicine is currently out of stock.', 'Out of Stock');
      return;
    }
    if (med.isExpired || this.expiredMedicineNames.has(med.medicine_name)) {
      this.toastr.error(`${med.medicine_name} is expired and cannot be selected.`, 'Expired Medicine');
      return;
    }
    const alreadyExists = this.medicinesArray.controls.some((ctrl) => ctrl.get('medicine_name')?.value === med.medicine_name);
    if (alreadyExists) {
      this.toastr.warning(`${med.medicine_name} is already added to the list.`, 'Duplicate Medicine');
      return;
    }
    const price = med.medicine?.price ?? 0;
    const medicineGroup = this.fb.group({
      medicine_name: [med.medicine_name],
      quantity: [1, [Validators.required, Validators.min(1)]],
      charge: [price],
      dosageInstruction: [''],
      availableStock: [med.current_stock],
      checkbox: this.fb.group({
        morning: [false], noon: [false], evening: [false], night: [false],
      }),
    });
    medicineGroup.get('quantity')?.valueChanges.subscribe(() => this.roundTotal());
    medicineGroup.get('charge')?.valueChanges.subscribe(() => this.roundTotal());
    this.medicinesArray.push(medicineGroup);
    this.roundTotal();
    this.medicineSearchControl.setValue('');
    this.filteredMedicines = [];
    this.toastr.success(`${med.medicine_name} added successfully.`, 'Medicine Added');
  }
  checkQuantity(index: number): void {
    const row = this.medicinesArray.at(index);
    const enteredQty = row.get('quantity')?.value;
    const available = row.get('availableStock')?.value;
    if (enteredQty > available) {
      row.get('quantity')?.setValue(available);
      this.toastr.warning(`Only <strong>${available}</strong> units are available in stock.`,
        'Stock Limit Exceeded',
        { enableHtml: true, timeOut: 5000, positionClass: 'toast-bottom-right', closeButton: true, progressBar: true }
      );
    }
    if (enteredQty < 1) {
      row.get('quantity')?.setValue(1);
      this.toastr.info(`Minimum quantity is <strong>1</strong>.`,
        'Invalid Quantity',
        { enableHtml: true, timeOut: 3000, positionClass: 'toast-bottom-right', closeButton: true, progressBar: true }
      );
    }
  }
  removeMedicineRow(index: number) {
    this.medicinesArray.removeAt(index);
    this.roundTotal();
  }
  updateDosageInstruction(event: any, value: string, index: number) {
    const dosageControl = (this.medicinesArray.at(index) as FormGroup).get('dosageInstruction');
    let currentVal = dosageControl?.value || '';
    let parts = currentVal ? currentVal.split(',').map((v: any) => v.trim()).filter((v: any) => v) : [];
    if (event.target.checked) { if (!parts.includes(value)) { parts.push(value); } }
    else { parts = parts.filter((v: string) => v !== value); }
    currentVal = parts.join(', ');
    dosageControl?.setValue(currentVal);
  }
  get medicinesArray(): FormArray { return this.pharmareq.get('medicinesArray') as FormArray; }
  getCheckboxControl(row: AbstractControl, time: 'morning' | 'noon' | 'evening' | 'night'): FormControl {
    const control = row.get(['checkbox', time]);
    if (!control) throw new Error(`Missing checkbox.${time} control`);
    return control as FormControl;
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) { event.preventDefault(); }
  }
  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;
    if (this.pharmareq.invalid) {
      this.pharmareq.markAllAsTouched();
      this.toastr.error('Please fill all required fields correctly', 'Form Validation Error');
      return;
    }
    if (this.medicinesArray.length === 0) {
      this.toastr.error('Please add at least one medicine', 'No Medicines Added');
      return;
    }
    const formValue = this.pharmareq.value;
    const payload = {
      uniqueHealthIdentificationId: formValue.uniqueHealthIdentificationId,
      patientType: formValue.patientType,
      pharmacistUserId: formValue.pharmacistUserId || this.userId,
      walkInPatient: {
        name: formValue.walkInPatient.name,
        age: formValue.walkInPatient.age,
        gender: formValue.walkInPatient.gender,
        mobile_no: formValue.walkInPatient.mobile_no,
        doctor_name: formValue.walkInPatient.doctor_name,
      },
      status: formValue.status,
      total: formValue.total,
      transactionId: formValue.transactionId,
      cashAmount: formValue.cashAmount,
      cardAmount: formValue.cardAmount,
      upiAmount: formValue.upiAmount,
      isWalkIn: true,
      packages: formValue.medicinesArray.map((med: any) => ({
        medicineName: med.medicine_name,
        quantity: Number(med.quantity) || 0,
        dosageInstruction: med.dosageInstruction || '',
        charge: Number(med.charge) || 0,
        checkbox: {
          morning: !!med.checkbox?.morning,
          noon: !!med.checkbox?.noon,
          evening: !!med.checkbox?.evening,
          night: !!med.checkbox?.night,
        },
      })),
    };
    try {
      await firstValueFrom(this.pharmaservice.walkinpharmacy(payload));
      this.pharmareq.reset();
      this.medicinesArray.clear();
      this.manuallySelected = false;
      this.router.navigateByUrl('/pharmalayout/walkinpharma');
    } catch (err: any) {
      // optionally add error handling as needed
    }
  }
  onPaymentChange(updatedPayment: any) {
    if (this.isUpdating) return;
    this.isUpdating = true;
    this.pharmareq.patchValue({
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
