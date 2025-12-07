import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IndianCurrencyPipe } from './../../../../pipe/indian-currency.pipe';
import { BedwardroomService } from '../../../mastermodule/bedmanagement/bedservice/bedwardroom.service';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { SurgerypackagemasterService } from '../../../mastermodule/surgerymaster/operation/surgerypackagemaster/service/surgerypackagemaster.service';
import { IpdService } from '../../ipdservice/ipd.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';
import { consoleLogger } from '../../../../helper/consoleLogger';
import { OtmoduleService } from '../service/otmodule.service';

@Component({
  selector: 'app-operationcharge',
  templateUrl: './operationcharge.component.html',
  styleUrls: ['./operationcharge.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IndianCurrencyPipe],
})
export class OperationchargeComponent implements OnInit {
  otchargeform: FormGroup;
  packages: any[] = [];
  roomTypes: any[] = [];
  isSubmitting = false;
  editMode = false;
  otchargeId: string | null = null;
  packageBreakdownEnabled = true;
  selectedFile: File | null = null;
  selectedRoomIndex: number | null = null;
  surgerySearchResults: any[] = [];
  surgerySearchLoading = false;
  showSurgeryDropdown = false;
  typeManuallyEdited = false;
  surgeryMaster: any;
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  ipdbill: any[] = [];
  ipdCaseId: string = '';
  dropdownOpen = false;
  surgeryData: any = null;
  userPermissions: any = {};
  users: any[] = [];
  filteredStaff: any[] = [];
  showStaffDropdownIndex: number | null = null;

  chargeTypeOptions = [
    'Dr. Charges',
    'Asst. Dr.Charges',
    'Anesthesia Charges',
    // 'OT Charges', (commented)
    'Hospital Charges',
    'Labour Room Charges',
    'Delivery Charges',
    'Operation Charges',
  ];

  constructor(
    private fb: FormBuilder,
    private service: SurgerypackagemasterService,
    private roomTypeService: BedwardroomService,
    private masterService: MasterService,
    private router: Router,
    private route: ActivatedRoute,
    private ipdservice: IpdService,
    private uhidService: UhidService,
    private userservice: RoleService,
    private otmoduleService: OtmoduleService
  ) {
    this.otchargeform = this.fb.group({
      uniqueHealthIdentificationId: [''],
      inpatientCaseId: [''],
      uhid: [''],
      patient_name: [''],
      bed_id: [''],
      admissionDate: [''],
      age: [''],
      patient_type: [''],
      consultingDoctorId: [''],
      operationId: [''],
      name: ['', Validators.required],
      note: [''],
      totalPrice: [ Validators.required],
      duration: [],
      ottype: [''],
      status: ['Active'],
      entries: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.fetchUsersForPrefill();
    this.route.queryParams.subscribe((params) => {
      const patientId = params['id'] || params['_id'];
      if (patientId) this.loadSurgery(patientId);
    });
    this.fetchPackages();
    this.fetchRoomTypes();

    const charges = this.chargeTypeOptions.map((type) =>
      this.fb.group({
        chargeType: [type],
        amount: [ Validators.required],
        staffName: [''],
        staffId: [''],
      })
    );
    this.otchargeform.setControl('entries', this.fb.array(charges));

    this.entries.valueChanges.subscribe((entries) => {
      const sum = entries.reduce(
        (acc: number, row: any) => acc + (Number(row.amount) || 0),
        0
      );
      this.otchargeform.get('totalPrice')?.setValue(sum, { emitEvent: false });
    });

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'oprationCharge'
    );
    this.userPermissions = uhidModule?.permissions || {};
  }

  get entries(): FormArray {
    return this.otchargeform.get('entries') as FormArray;
  }
  fetchUsersForPrefill(): void {
    this.userservice.getuser(1, 10, '').subscribe((res) => {
      this.users = res.data || [];
    });
  }

  fetchPackages(): void {
    this.service.getsurgerypackagemasters(1, 10, '').subscribe((result) => {
      this.packages = result?.data || result || [];
    });
  }

  fetchRoomTypes(): void {
    this.roomTypeService.getroomTyp(1, 100, '').subscribe((res) => {
      this.roomTypes = res?.roomTypes || res.data || [];
    });
  }

  loadSurgery(packageId: string) {
    this.ipdservice.getOperationTheatreById(packageId).subscribe({
      next: (res: any) => {
        this.surgeryMaster = res;
        this.surgeryData = res;

        const mainPkg = res.surgeryPackage
          ? res.surgeryPackage
          : Array.isArray(res.surgeryPackages) && res.surgeryPackages.length > 0
          ? res.surgeryPackages[0]
          : {};

        this.otchargeform.patchValue({
          uhid: res.uniqueHealthIdentificationId?.uhid || '',
          patient_name: res.uniqueHealthIdentificationId?.patient_name || '',
          age: res.uniqueHealthIdentificationId?.age || '',
          bed_id: res.inpatientCaseId?.bed_id?.bed_number || '',
          uniqueHealthIdentificationId: res.uniqueHealthIdentificationId?._id || '',
          inpatientCaseId: res.inpatientCaseId?._id || '',
          operationId: res?._id || '',
          name: mainPkg?.name || '',
          ottype: res.ottype || '',
          totalPrice: res?.netAmount || mainPkg?.totalPrice || 0,
          duration: mainPkg?.duration || '',
          note: res.note || '',
        });

        this.entries.clear();

        // Patch data for all charge types (with fallback defaults)
        const entryRows =
          (res.entries && res.entries.length) ? res.entries : (mainPkg.breakdown || []);

        this.chargeTypeOptions.forEach(type => {
          const found = entryRows.find(
            (row: any) =>
              (row.chargeType && row.chargeType === type) ||
              (row.type && row.type === type)
          );
          this.entries.push(
            this.fb.group({
              chargeType: [type],
              amount: [found ? found.amount || 0 : 0, Validators.required],
              staffName: [found ? found.staffName || found.doctor || '' : ''],
              staffId: [found ? found.staffId || '' : '']
            })
          );
        });

        this.packageBreakdownEnabled = true;
      },
    });
  }

  onStaffSearch(value: string, entry: FormGroup, index: number) {
    this.userservice.getuser(1, 15, value).subscribe((res) => {
      this.filteredStaff = res?.data || res || [];
      this.showStaffDropdownIndex = index;
    });
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
      staffId: user._id
    });
    this.showStaffDropdownIndex = null;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value || '';
  }

  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;
    if (this.otchargeform.invalid) {
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

    const formValue = this.otchargeform.value;
    // Only send rows with amount or staff filled
    const filteredEntries = formValue.entries
      .filter(
        (row: any) => Number(row.amount) > 0 || (row.staffName && row.staffName.trim().length)
      )
      .map((row: any) => {
        // Omit staffId if it is not set (empty/undefined/null)
        const entry: any = {
          chargeType: row.chargeType,
          amount: row.amount,
          staffName: row.staffName
        };
        if (row.staffId) entry.staffId = row.staffId;
        return entry;
      });

    const finalPayload = {
      uniqueHealthIdentificationId: formValue.uniqueHealthIdentificationId,
      inpatientCaseId: formValue.inpatientCaseId,
      operationId: formValue.operationId,
      name: formValue.name,
      ottype: formValue.ottype,
      totalPrice: formValue.totalPrice,
      note: formValue.note,
      status: formValue.status,
      entries: filteredEntries,
    };

    this.isSubmitting = true;
    this.otmoduleService.postoperationChargeapis(finalPayload).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Charges Saved',
          text: 'Operation charges saved successfully.',
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
        this.isSubmitting = false;
        this.otchargeform.reset();
        if (res?.inpatientCaseId || res.data?.inpatientCaseId) {
          this.router.navigate(['/ipd/intermbill'], {
            queryParams: { id: res?.inpatientCaseId || res.data?.inpatientCaseId },
          });
        } else {
          this.router.navigate(['/ipd/otcharge']);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: err?.error?.message || 'Failed to submit operation charges.',
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
}
