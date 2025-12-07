import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common';
import { debounceTime, switchMap, of, Subscription } from 'rxjs';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { IpdService } from '../../ipdservice/ipd.service';
import { SurgerypackagemasterService } from '../../../mastermodule/surgerymaster/operation/surgerypackagemaster/service/surgerypackagemaster.service';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-otsheet',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    IndianCurrencyPipe,
  ],
  templateUrl: './otsheet.component.html',
  styleUrls: ['./otsheet.component.css'],
})
export class OtsheetComponent implements OnInit, OnDestroy {
  otsheet: FormGroup;
  manualEntryEnabled = false;
  manualSurgeryForm: FormGroup;
  chargeTypeOptions = [
    'Dr. Charges',
    'Asst. Dr.Charges',
    'Anesthesia Charges',
    // 'OT Charges',
    'Hospital Charges',
    'Labour Room Charges',
    'Delivery Charges',
    'Operation Charges',
  ];
  filteredStaff: any[] = [];
  showStaffDropdownIndex: number | null = null;
  surgeryMaster: any[] = [];
  filteredPatients: any[] = [];
  showSuggestions = false;
  manuallySelected = false;
  userPermissions: any = {};
  uhidTodayRecords: any[] = [];
  showUHIDDropdown = false;
  currentPage = 1;
  totalPages = 1;
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  selectedPatientDetails: any = null;
  ipdId: string = '';
  otid: string = '';
  editMode: boolean = false;
  user: string = '';
  selectedSurgeries: any[] = [];
  selectedPatient: any = null;
  selectedPatientRoomType: any = null;
  surgeryForm: FormGroup;

  showSurgerySuggestions: boolean[] = [];
  filteredSurgeryList: any[][] = [];

  // ---- For reactive sum calculation and cleanup ----
  private _breakdownSumWatcher?: Subscription;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private uhidService: UhidService,
    private ipdservice: IpdService,
    private router: Router,
    private route: ActivatedRoute,
    private SurgerypackagemasterService: SurgerypackagemasterService,
    private userservice: RoleService
  ) {
    this.otsheet = this.fb.group({
      surgeryno: [''],
      surgeryDate: [''],
      surgeryStartTime: [''],
      surgeryEndTime: [''],
      uhid: [''],
      patient_name: [''],
      age: [''],
      admittingDoctorId: [''],
      bed_id: [''],
      height: [''],
      weight: [''],
      anesthesiaType: [''],
      implantDetails: [''],
      equipmentUsed: [''],
      highRisk: [false],
      risk: [false],
      emergency: [false],
      netAmount: [''],
      uniqueHealthIdentificationId: [''],
      surgeryPackageId: this.fb.array([]),
      createdBy: [''],
    });

    this.surgeryForm = this.fb.group({
      surgeryPackageId: this.fb.array([]),
    });

    this.manualSurgeryForm = this.fb.group({
      name: ['', Validators.required],
      ottype: ['', Validators.required],
      totalPrice: [ [Validators.required, Validators.min(1)]],
      note: [''],
      breakdown: this.fb.array(this.chargeTypeOptions.map(type =>
        this.fb.group({
          chargeType: [type], // fixed value
          amount: [ [Validators.required, Validators.min(0)]],
          staffName: [''],
          staffId: ['']
        })
      ))
    });
    this.setupBreakdownSumWatcher();
  }

  get surgeries(): FormArray {
    return this.otsheet.get('surgeryPackageId') as FormArray;
  }

  get breakdown(): FormArray {
    return this.manualSurgeryForm.get('breakdown') as FormArray;
  }

  ngOnInit(): void {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    this.otsheet.patchValue({
      surgeryDate: currentDate,
      surgeryStartTime: currentTime,
      surgeryEndTime: currentTime,
    });

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'oprationTheatresheet'
    );
    this.userPermissions = uhidModule?.permissions || {};
    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    this.user = user?._id || '';

    this.route.queryParams.subscribe((params) => {
      const ipdid = params['id'];
      const otsheetid = params['otid'];
      this.ipdId = ipdid || '';
      if (ipdid) {
        this.getPatientFromCase(ipdid);
      } else if (otsheetid) {
        this.editMode = true;
        this.otid = otsheetid;
      }
    });

    this.otsheet
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

    this.addSurgery();

    this.SurgerypackagemasterService.getsurgerypackagemasters(
      this.currentPage
    ).subscribe((res) => {
      this.surgeryMaster = res?.packages ? res.packages : res.data;
      this.totalPages = res.totalPages || 1;
    });

    this.setupBreakdownSumWatcher();
  }

  ngOnDestroy(): void {
    if (this._breakdownSumWatcher) {
      this._breakdownSumWatcher.unsubscribe();
    }
  }

  private setupBreakdownSumWatcher() {
    if (this._breakdownSumWatcher) {
      this._breakdownSumWatcher.unsubscribe();
    }
    this._breakdownSumWatcher = this.breakdown.valueChanges.subscribe((entries: any[]) => {
      const sum = entries.reduce(
        (a: number, b: any) => a + (Number(b.amount) || 0),
        0
      );
      this.manualSurgeryForm
        .get('totalPrice')
        ?.setValue(sum, { emitEvent: false });
    });
  }

  addSurgery(): void {
    this.surgeries.push(
      this.fb.group({
        name: [''],
        type: [''],
        surgerytime: [''],
        risk: [false],
        emergency: [false],
        amount: [''],
        surgeryPackageId: [''],
        packageId: [''],
      })
    );
  }
  removeSurgery(i: number): void {
    this.surgeries.removeAt(i);
  }

  toggleManualEntry() {
    this.manualEntryEnabled = !this.manualEntryEnabled;
    if (this.manualEntryEnabled) {
      this.manualSurgeryForm.reset({
        name: '',
        ottype: '',
        totalPrice: 0,
        note: '',
        breakdown: [],
      });
      this.manualSurgeryForm.setControl('breakdown', this.fb.array(
        this.chargeTypeOptions.map(type =>
          this.fb.group({
            chargeType: [type],
            amount: [ [Validators.required, Validators.min(0)]],
            staffName: [''],
            staffId: ['']
          })
        )
      ));
      this.setupBreakdownSumWatcher(); // Rebind after resetting array!
    }
  }

  onManualEntrySubmit() {
    if (this.manualSurgeryForm.invalid) {
      return;
    }
    const manualEntry = this.manualSurgeryForm.value;
    manualEntry.breakdown = manualEntry.breakdown
      .filter((row: any) =>
        (row.amount && Number(row.amount) > 0) || (row.staffName && row.staffName.trim().length))
      .map((row: any) => {
        const entry: any = {
          chargeType: row.chargeType,
          amount: row.amount,
          staffName: row.staffName
        };
        if (row.staffId) entry.staffId = row.staffId;
        return entry;
      });
    this.otsheet.patchValue({
      manualEntryEnabled: true,
      manualOperationEntries: [manualEntry],
    });
    this.OnSubmit();
    this.manualEntryEnabled = false;
  }

  getStaffPlaceholder(type: string): string {
    return 'Search/select staff';
  }

  onStaffFocus(index: number) {
    this.showStaffDropdownIndex = index;
  }
  onStaffBlur() {
    setTimeout(() => {
      this.showStaffDropdownIndex = null;
    }, 200);
  }
  onStaffSelect(user: any, entry: FormGroup, index: number) {
    entry.patchValue({
      staffName: user.name,
      staffId: user._id,
    });
    this.showStaffDropdownIndex = null;
  }
  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value || '';
  }
  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  onStaffSearch(value: string, entry: FormGroup | null, index: number) {
    if (!entry) return;
    this.userservice.getuser(1, 15, value).subscribe((res) => {
      this.filteredStaff = res?.data || res || [];
      this.showStaffDropdownIndex = index;
    });
  }

  selectPatientFromUHID(record: any): void {
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }
  selectPatient(patient: any): void {
    this.manuallySelected = true;
    this.selectedPatient = patient;
    this.selectedPatientRoomType = {
      roomTypeId: patient.room_id?.room_type_id?._id,
      roomTypeName: patient.room_id?.room_type_id?.name,
      roomPrice: patient.room_id?.room_type_id?.price_per_day,
      roomDescription: patient.room_id?.room_type_id?.description,
    };
    const formattedAdmissionDate = patient?.admissionDate
      ? new Date(patient.admissionDate).toISOString().split('T')[0]
      : '';
    this.otsheet.patchValue({
      uhid: patient?.uniqueHealthIdentificationId?.uhid || '',
      patient_name: patient?.uniqueHealthIdentificationId?.patient_name || '',
      age: patient?.uniqueHealthIdentificationId?.age || '',
      gender: patient?.uniqueHealthIdentificationId?.gender || '',
      patientUhidId: patient?.uniqueHealthIdentificationId?._id || '',
      admissionDate: formattedAdmissionDate || '',
      bed_id: patient?.bed_id?.bed_number || '',
      height: patient.vitals[0]?.height,
      weight: patient.vitals[0]?.weight,
      admittingDoctorId: patient?.admittingDoctorId?.name || '',
      uniqueHealthIdentificationId: patient?.uniqueHealthIdentificationId,
      roomTypeId: this.selectedPatientRoomType.roomTypeId,
      createdBy: this.user,
    });
    this.showSuggestions = false;
    this.filteredPatients = [];
  }

  getPatientFromCase(id: string) {
    this.ipdservice.getIPDcaseById(id).subscribe((res: any) => {
      const patient = res.data || res;
      if (patient) {
        this.selectPatientOnUHID(patient);
      }
    });
  }
  selectPatientOnUHID(patient: any) {
    this.manuallySelected = true;
    this.selectedPatient = patient;
    this.selectedPatientRoomType = {
      roomTypeId: patient.room_id?.room_type_id?._id,
      roomTypeName: patient.room_id?.room_type_id?.name,
      roomPrice: patient.room_id?.room_type_id?.price_per_day,
      roomDescription: patient.room_id?.room_type_id?.description,
    };
    const formattedAdmissionDate = patient?.admissionDate
      ? new Date(patient.admissionDate).toISOString().split('T')[0]
      : '';
    this.otsheet.patchValue({
      uhid: patient?.uniqueHealthIdentificationId?.uhid || '',
      patient_name: patient?.uniqueHealthIdentificationId?.patient_name || '',
      age: patient?.uniqueHealthIdentificationId?.age || '',
      gender: patient?.uniqueHealthIdentificationId?.gender || '',
      patientUhidId: patient?.uniqueHealthIdentificationId?._id || '',
      admissionDate: formattedAdmissionDate || '',
      bed_id: patient?.bed_id?.bed_number || '',
      height: patient.vitals[0]?.height,
      weight: patient.vitals[0]?.weight,
      admittingDoctorId: patient?.admittingDoctorId?.name || '',
      uniqueHealthIdentificationId: patient?.uniqueHealthIdentificationId,
    });
    this.selectedPatientDetails = patient;
    this.filteredPatients = [];
    this.showSuggestions = false;
  }
  onPatientInput() {
    const searchTerm = this.otsheet.get('patient_name')?.value;
    if (this.manuallySelected && (!searchTerm || searchTerm.length < 2)) {
      this.manuallySelected = false;
    }
    if (!searchTerm || searchTerm.length <= 2) {
      this.filteredPatients = [];
      this.showSuggestions = false;
      return;
    }
    this.showSuggestions = true;
  }
  onUhidInput() {
    const searchTerm = this.otsheet.get('uhid')?.value;
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

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;
    if (this.otsheet.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill all required fields before submitting.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      return;
    }

    const formValue = this.otsheet.value;
    let manualEntryEnabled = false;
    let manualOperationEntries: any[] = [];
    let surgeryPackageIds: any[] = [];
    let netAmount = formValue.netAmount;

    if (formValue.manualEntryEnabled || this.manualEntryEnabled) {
      manualEntryEnabled = true;
      manualOperationEntries =
        formValue.manualOperationEntries && formValue.manualOperationEntries.length
          ? formValue.manualOperationEntries
          : [this.manualSurgeryForm.value];
      manualOperationEntries = manualOperationEntries.map(entry => {
        if (entry.breakdown && entry.breakdown.length) {
          entry.breakdown = entry.breakdown
            .filter((row: any) =>
              (row.amount && Number(row.amount) > 0) || (row.staffName && row.staffName.trim().length))
            .map((row: any) => {
              if (!row.staffId || row.staffId === '') delete row.staffId;
              return row;
            });
        }
        return entry;
      });
      surgeryPackageIds = [];
      if (manualOperationEntries.length > 0) {
        netAmount = manualOperationEntries[0].totalPrice;
      }
    } else {
      manualEntryEnabled = false;
      manualOperationEntries = [];
      surgeryPackageIds = this.surgeries.controls
        .map((ctrl) => ctrl.get('surgeryPackageId')?.value)
        .filter((id) => !!id);
    }

    const finalPayload = {
      uniqueHealthIdentificationId: formValue.uniqueHealthIdentificationId,
      surgeryPackageIds,
      manualEntryEnabled,
      manualOperationEntries,
      surgeryDate: formValue.surgeryDate,
      surgeryStartTime: formValue.surgeryStartTime,
      surgeryEndTime: formValue.surgeryEndTime,
      anesthesiaType: formValue.anesthesiaType,
      implantDetails: formValue.implantDetails,
      equipmentUsed: formValue.equipmentUsed,
      highRisk: formValue.highRisk,
      emergency: formValue.emergency,
      risk: formValue.risk,
      netAmount,
      inpatientCaseId: this.ipdId || '',
      createdBy: this.user,
    };

    if (this.editMode && this.otid) {
      this.ipdservice
        .updateoprationTheatresheet(this.otid, finalPayload)
        .subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Updated successfully',
              text: 'OT Sheet has been updated successfully.',
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
            this.otsheet.reset();
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
              text: err,
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
      this.ipdservice.postoprationTheatresheet(finalPayload).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Operation Created',
            text: 'OT Sheet has been submitted successfully.',
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
          this.otsheet.reset();
          if (res?.inpatientCaseId || res.data?.inpatientCaseId) {
            this.router.navigate(['/ipdpatientsummary'], {
              queryParams: {
                id: res?.inpatientCaseId || res.data?.inpatientCaseId,
              },
            });
          } else {
            this.router.navigate(['/ipdpatientsummary']);
          }
        },
        error: (err) => {
          let errorMessage = 'Something went wrong while creating the OT Sheet.';
          if (err?.status === 409) {
            errorMessage = 'An OT Sheet already exists for this patient.';
            Swal.fire({
              text: errorMessage,
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-swal-text',
                confirmButton: 'hospital-swal-button',
              },
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/ipdpatientsummary'], {
                  queryParams: { id: this.ipdId },
                });
              }
            });
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
            Swal.fire({
              icon: 'error',
              title: 'Submission Failed',
              text: errorMessage,
              customClass: {
                popup: 'hospital-swal-popup',
                title: 'hospital-swal-title',
                htmlContainer: 'hospital-toast-text',
                confirmButton: 'hospital-swal-button',
              },
            });
          }
        },
      });
    }
  }

  // Surgery package search and selection logic remains untouched
  onSurgeryInput(index: number) {
    const inputVal = this.surgeries
      .at(index)
      .get('name')
      ?.value?.trim()
      .toLowerCase();
    if (!inputVal || inputVal.length < 2) {
      this.filteredSurgeryList[index] = [];
      return;
    }
    const selectedIds = this.surgeries.controls
      .filter((ctrl, i) => i !== index)
      .map(
        (ctrl) =>
          ctrl.get('surgeryPackageId')?.value || ctrl.get('packageId')?.value
      );
    this.filteredSurgeryList[index] = this.surgeryMaster.filter(
      (s) =>
        s.name.toLowerCase().includes(inputVal) && !selectedIds.includes(s._id)
    );
    console.log('filter ot name ', this.filteredSurgeryList[index]);
  }

  hideSurgerySuggestionsWithDelay(index: number) {
    setTimeout(() => (this.showSurgerySuggestions[index] = false), 200);
  }

  selectSurgery(surgery: any, index: number) {
    this.selectedSurgeries[index] = surgery;
    const surgeryGroup = this.surgeries.at(index) as FormGroup;

    let finalPrice = surgery.totalPrice;
    let pricingSource = 'Base Price (No room rates available)';
    let roomSpecificBreakdown = null;
    if (surgery.roomWiseBreakdown && surgery.roomWiseBreakdown.length > 0) {
      if (this.selectedPatientRoomType) {
        const matchingRoom = surgery.roomWiseBreakdown.find(
          (room: any) =>
            room.roomTypeId === this.selectedPatientRoomType.roomTypeId
        );
        if (matchingRoom) {
          finalPrice = matchingRoom.packagePrice;
          pricingSource = `${this.selectedPatientRoomType.roomTypeName} Room Price`;
          roomSpecificBreakdown = matchingRoom.breakdown || [];
        } else {
          finalPrice = surgery.totalPrice;
          pricingSource = `Base Price (${this.selectedPatientRoomType.roomTypeName} not available)`;
        }
      } else {
        finalPrice = surgery.totalPrice;
        pricingSource = 'Base Price (Select patient for room pricing)';
      }
    } else {
      finalPrice = surgery.totalPrice;
      pricingSource = 'Fixed Package Price';
    }

    surgeryGroup.patchValue({
      name: surgery.name,
      basePrice: finalPrice,
      originalPrice: surgery.totalPrice,
      duration: surgery.duration ? `${surgery.duration} days` : 'N/A',
      packageId: surgery._id,
      type: surgery.type || '',
      pricingSource: pricingSource,
      roomSpecificBreakdown: roomSpecificBreakdown,
      surgeryPackageId: surgery._id,
      amount: finalPrice,
      grade: surgery.grade || '',
      category: surgery.category || surgery.type || '',
      surgery_time: surgery.duration ? `${surgery.duration * 60}` : '0',
      createdBy: surgery.createdBy,
    });

    this.showSurgerySuggestions[index] = false;

    this.calculateNetAmount();
  }

  getSelectedSurgery(index: number): any {
    return this.selectedSurgeries[index] || null;
  }

  getPricingStructureText(surgery: any): string {
    if (surgery.breakdown && surgery.breakdown.length > 0) {
      return 'Has charge breakdown';
    } else if (
      surgery.roomWiseBreakdown &&
      surgery.roomWiseBreakdown.length > 0
    ) {
      return 'Room-wise pricing available';
    } else {
      return 'Fixed price';
    }
  }

  viewSurgeryDetails(index: number) {
    const surgery = this.selectedSurgeries[index];
    if (surgery) {
      console.log('Surgery details:', surgery);
    }
  }

  getSurgeryPricingInfo(index: number): any {
    const surgery = this.selectedSurgeries[index];
    if (!surgery) return null;

    let hasRoomPricing = false;
    let roomPrice = surgery.totalPrice;
    let priceDifference = 0;

    if (surgery.roomWiseBreakdown && surgery.roomWiseBreakdown.length > 0) {
      if (this.selectedPatientRoomType) {
        const matchingRoom = surgery.roomWiseBreakdown.find(
          (room: any) =>
            room.roomTypeId === this.selectedPatientRoomType.roomTypeId
        );
        if (matchingRoom && matchingRoom.packagePrice) {
          hasRoomPricing = true;
          roomPrice = matchingRoom.packagePrice;
          priceDifference = roomPrice - surgery.totalPrice;
        }
      }
    }

    return {
      hasRoomPricing: hasRoomPricing,
      hasRoomBreakdown: !!(
        surgery.roomWiseBreakdown && surgery.roomWiseBreakdown.length > 0
      ),
      roomPrice: roomPrice,
      basePrice: surgery.totalPrice,
      roomName: this.selectedPatientRoomType?.roomTypeName || 'Unknown',
      priceDifference: priceDifference,
      isFixedPrice:
        !surgery.roomWiseBreakdown || surgery.roomWiseBreakdown.length === 0,
    };
  }

  getRoomSpecificPrice(surgery: any): number {
    let price = surgery.totalPrice;
    if (
      surgery.roomWiseBreakdown &&
      surgery.roomWiseBreakdown.length > 0 &&
      this.selectedPatientRoomType
    ) {
      const matchingRoom = surgery.roomWiseBreakdown.find(
        (room: any) =>
          room.roomTypeId === this.selectedPatientRoomType.roomTypeId
      );
      if (matchingRoom && matchingRoom.packagePrice) {
        price = matchingRoom.packagePrice;
      }
    }
    return price;
  }

  updateSurgeryPricingForRoom() {
    this.surgeries.controls.forEach((control: any, index: number) => {
      const selectedSurgery = this.selectedSurgeries[index];
      if (selectedSurgery) {
        this.selectSurgery(selectedSurgery, index);
      }
    });
  }

  calculateNetAmount() {
    let total = 0;
    this.surgeries.controls.forEach((control) => {
      const amount =
        control.get('basePrice')?.value || control.get('amount')?.value || 0;
      total += +amount;
    });

    this.otsheet.get('netAmount')?.setValue(total);
  }
}
