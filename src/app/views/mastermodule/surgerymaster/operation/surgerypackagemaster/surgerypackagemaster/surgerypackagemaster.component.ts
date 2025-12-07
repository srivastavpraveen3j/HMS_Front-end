import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SurgerypackagemasterService } from '../service/surgerypackagemaster.service';
import { BedwardroomService } from '../../../../bedmanagement/bedservice/bedwardroom.service';
import { MasterService } from '../../../../masterservice/master.service';
import { CommonModule } from '@angular/common';
import { IndianCurrencyPipe } from '../../../../../../pipe/indian-currency.pipe';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { debounceTime, switchMap, map } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';

@Component({
  selector: 'app-surgerypackagemaster',
  templateUrl: './surgerypackagemaster.component.html',
  styleUrls: ['./surgerypackagemaster.component.css'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule, IndianCurrencyPipe, RouterModule]
})
export class SurgerypackagemasterComponent implements OnInit {
  packageForm: FormGroup;
  packages: any[] = [];
  roomTypes: any[] = [];
  isSubmitting = false;
  editMode = false;
  surgeryid: string | null = null;
  chargeTypes = [
    { key: 'doctorCharges', label: 'Doctor Charges' },
    { key: 'anesthesiaCharges', label: 'Anesthesia Charges' },
    { key: 'otCharges', label: 'OT Charges' },
    { key: 'assistantCharges', label: 'Assistant Charges' },
    { key: 'consumables', label: 'Consumables' }
  ];
  roomBreakdownEnabled = false;
  packageBreakdownEnabled = false;
  uploadMode: 'single' | 'bulk' = 'single';
  selectedFile: File | null = null;

  // Surgery Live Search
  surgerySearchResults: any[] = [];
  surgerySearchLoading = false;
  showSurgeryDropdown = false;
  private searchName$ = new BehaviorSubject<string>('');
  typeManuallyEdited = false;

  constructor(
    private fb: FormBuilder,
    private service: SurgerypackagemasterService,
    private roomTypeService: BedwardroomService,
    private masterService: MasterService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.packageForm = this.fb.group({
      name: ['', Validators.required],
      type: [''],
      note: [''],
      totalPrice: [0, Validators.required],
      duration: [ ],
      status: ['Active', Validators.required],
      breakdown: this.fb.group({
        doctorCharges: this.fb.group({ amount: [0, Validators.required], percentage: [0, Validators.required] }),
        anesthesiaCharges: this.fb.group({ amount: [0, Validators.required], percentage: [0, Validators.required] }),
        otCharges: this.fb.group({ amount: [0, Validators.required], percentage: [0, Validators.required] }),
        assistantCharges: this.fb.group({ amount: [0, Validators.required], percentage: [0, Validators.required] }),
        consumables: this.fb.group({ amount: [0, Validators.required], percentage: [0, Validators.required] })
      }),
      roomWiseBreakdown: this.fb.array([])
    }, { validators: this.totalPercentValidator() });
  }

  ngOnInit(): void {
    this.fetchPackages();
    this.fetchRoomTypes();

    this.chargeTypes.forEach(ct => {
      const group = this.breakdown.get(ct.key) as FormGroup;
      group.get('percentage')?.valueChanges.subscribe(() => { this.syncAmountWithPercentage(ct.key); });
      group.get('amount')?.valueChanges.subscribe(() => { this.syncPercentageWithAmount(ct.key); });
    });

    this.packageForm.get('roomWiseBreakdown')?.valueChanges.subscribe(() => {
      if (this.roomBreakdownEnabled) {
        this.validateRoomSplits();
        this.validateRoomTypeDuplicates();
      }
    });

    // Live surgery name search setup
    this.searchName$.pipe(
      debounceTime(200),
      switchMap(val =>
        val && val.trim()
          ? this.masterService.getSurgerymaster(1, 20, val.trim()).pipe(map(res => res?.services || res?.data || []))
          : of([])
      )
    ).subscribe((results: any[]) => {
      this.surgerySearchResults = results;
      this.surgerySearchLoading = false;
    });

    this.packageForm.get('name')?.valueChanges.subscribe(val => {
      if (!this.typeManuallyEdited && typeof val === 'string' && val.trim()) {
        this.surgerySearchLoading = true;
        this.showSurgeryDropdown = true;
        this.searchName$.next(val.trim());
      } else if (!val?.trim()) {
        this.showSurgeryDropdown = false;
        this.surgerySearchResults = [];
      }
    });
    this.packageForm.get('type')?.valueChanges.subscribe(() => {
      this.typeManuallyEdited = true;
    });

    this.route.queryParams.subscribe((params) => {
      this.surgeryid = params['_id'] || null;
      this.editMode = !!this.surgeryid;
      if (this.editMode && this.surgeryid) {
        this.loadSurgery(this.surgeryid);
      }
    });
  }

  selectSurgeryFromDropdown(s: any) {
    this.packageForm.patchValue({
      name: s.name,
      type: (Array.isArray(s.category) ? s.category.join(', ') : s.category) || '',
      totalPrice : s.amount
    });
    this.typeManuallyEdited = false;
    this.showSurgeryDropdown = false;
    this.surgerySearchResults = [];
  }

  get breakdown(): FormGroup { return this.packageForm.get('breakdown') as FormGroup; }
  get roomWiseBreakdown(): FormArray { return this.packageForm.get('roomWiseBreakdown') as FormArray; }
  fetchPackages(): void {
    this.service.getsurgerypackagemasters(1, 10, '').subscribe((result) => {
      this.packages = result?.data || result || [];
    });
  }
  fetchRoomTypes(): void {
    this.roomTypeService.getroomTyp(1, 100, '').subscribe(res => {
      this.roomTypes = res?.roomTypes || res.data || [];
    });
  }
  addRoomWiseBreakdown() {
    this.roomWiseBreakdown.push(this.fb.group({
      roomTypeId: ['', Validators.required],
      roomName: [{ value: '', disabled: true }],
      roomDescription: [{ value: '', disabled: true }],
      roomPrice: [{ value: 0, disabled: true }],
      packagePrice: [0, Validators.required],
      drCharge: [0], anesthesia: [0], ot: [0], assistant: [0], consumables: [0]
    }));
  }
  removeRoomWiseBreakdown(idx: number) {
    this.roomWiseBreakdown.removeAt(idx);
    this.validateRoomTypeDuplicates();
  }
  onRoomTypeSelect(index: number): void {
    const ctrl = this.roomWiseBreakdown.at(index) as FormGroup;
    const selectedId = ctrl.get('roomTypeId')?.value;
    const selectedRoom = this.roomTypes.find(rt => rt._id === selectedId);
    ctrl.patchValue({
      roomName: selectedRoom?.name || '',
      roomDescription: selectedRoom?.description || '',
      roomPrice: selectedRoom?.price_per_day || 0
    });
    this.validateRoomTypeDuplicates();
  }

  getBreakdownTotal(): number {
    return this.chargeTypes
      .map(ct => Number(this.breakdown.get(ct.key)?.get('amount')?.value) || 0)
      .reduce((a, b) => a + b, 0);
  }
  getBreakdownPercent(): number {
    return this.chargeTypes
      .map(ct => Number(this.breakdown.get(ct.key)?.get('percentage')?.value) || 0)
      .reduce((a, b) => a + b, 0);
  }
  syncAmountWithPercentage(key: string) {
    const total = this.packageForm.get('totalPrice')?.value || 0;
    const percent = +this.breakdown.get(key)?.get('percentage')?.value || 0;
    const calcAmount = Math.round((total * percent) / 100);
    const amountCtrl = this.breakdown.get(key)?.get('amount');
    if (amountCtrl?.value !== calcAmount) amountCtrl?.setValue(calcAmount, { emitEvent: false });
  }
  syncPercentageWithAmount(key: string) {
    const total = this.packageForm.get('totalPrice')?.value || 0;
    const amount = +this.breakdown.get(key)?.get('amount')?.value || 0;
    const calcPercent = total > 0 ? Math.round((amount * 100) / total) : 0;
    const percentCtrl = this.breakdown.get(key)?.get('percentage');
    if (percentCtrl?.value !== calcPercent) percentCtrl?.setValue(calcPercent, { emitEvent: false });
  }
  totalPercentValidator() {
    return (fg: FormGroup) => {
      if (!this.packageBreakdownEnabled) return null;
      const bd = fg.get('breakdown') as FormGroup;
      const sum = this.chargeTypes
        .map(ct => Number(bd?.get(ct.key)?.get('percentage')?.value) || 0)
        .reduce((a, b) => a + b, 0);
      return sum > 100 ? { percentOver: true } : null;
    };
  }
  validateRoomSplits() {
    this.roomWiseBreakdown.controls.forEach(ctrl => {
      const group = ctrl as FormGroup;
      const price = +group.get('packagePrice')?.value || 0;
      const fields = ['drCharge', 'anesthesia', 'ot', 'assistant', 'consumables'];
      let sum = 0;
      fields.forEach(f => { sum += (+group.get(f)?.value || 0); });
      group.setErrors((sum > price) ? { ...(group.errors ?? {}), splitOver: true } : (group.errors && Object.keys(group.errors).length ? {} : null), { emitEvent: false });
    });
  }
  isRoomTypeSelected(roomTypeId: string, currentIndex: number): boolean {
    return this.roomWiseBreakdown.controls
      .some((group, idx) => idx !== currentIndex && group.get('roomTypeId')?.value === roomTypeId);
  }
  validateRoomTypeDuplicates() {
    const selected = this.roomWiseBreakdown.controls.map(ctrl => ctrl.get('roomTypeId')?.value);
    this.roomWiseBreakdown.controls.forEach((ctrl, i) => {
      const value = ctrl.get('roomTypeId')?.value;
      const count = selected.filter(v => v && v === value).length;
      ctrl.setErrors(count > 1 ? { ...(ctrl.errors ?? {}), duplicateRoomType: true } : (ctrl.errors && Object.keys(ctrl.errors).length ? {} : null), { emitEvent: false });
    });
  }

  async savePackage() {
    const Swal = (await import('sweetalert2')).default;
    if (
      (this.packageBreakdownEnabled && this.packageForm.hasError('percentOver')) ||
      (this.roomBreakdownEnabled && this.roomWiseBreakdown.controls.some(ctrl => ctrl.invalid))
    ) {
      this.packageForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Check your breakdowns/room splits/room type errors before saving.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button'
        }
      });
      return;
    }

    this.isSubmitting = true;
    const raw = this.packageForm.getRawValue();
    const payload: any = {
      name: raw.name,
      type: raw.type,
      note: raw.note,
      totalPrice: raw.totalPrice,
      duration: raw.duration,
      status: raw.status
    };
    if (this.packageBreakdownEnabled) {
      payload.breakdown = this.chargeTypes.map(ct => ({
        chargeType: ct.label, ...raw.breakdown[ct.key]
      }));
    }
    if (this.roomBreakdownEnabled) {
      payload.roomWiseBreakdown = raw.roomWiseBreakdown;
    }

    const request$ = this.editMode && this.surgeryid
      ? this.service.updatesurgerypackagemaster(this.surgeryid, payload)
      : this.service.postsurgerypackagemaster(payload);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.editMode ? 'Surgery Package Updated' : 'Surgery Package Created',
          text: `Surgery package has been ${this.editMode ? 'updated' : 'created'} successfully.`,
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          }
        });
        this.packageForm.reset();
        this.roomWiseBreakdown.clear();
        this.fetchPackages();
        this.isSubmitting = false;
        this.router.navigate(['/master/surgerypackagemasterlist']);
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: this.editMode ? 'Update Failed' : 'Creation Failed',
          text: err?.error?.message || `Something went wrong while ${this.editMode ? 'updating' : 'creating'} the surgery package.`,
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button'
          }
        });
      }
    });
  }
selectedSurgery : any
loadSurgery(packageId: string) {
  this.service.getsurgerypackagemasterById(packageId).subscribe({
    next: (res: any) => {
      let pack: any = null;
      if (res && res._id) pack = res;
      else if (res.packages) pack = Array.isArray(res.packages) ? res.packages[0] : res.packages;
      else if (res.package) pack = res.package;
      else if (res.data) pack = res.data;

      if (pack && pack._id) {
        const patchB: any = {};
        this.chargeTypes.forEach(ct => {
          const found = (pack.breakdown || []).find((b: any) => b.chargeType === ct.label);
          patchB[ct.key] = found ? { amount: found.amount, percentage: found.percentage } : { amount: 0, percentage: 0 };
        });

        // Find the corresponding surgery service for dropdown
        this.findSurgeryServiceByName(pack.name).then(surgeryService => {
          // Set the selected surgery for dropdown reference
          this.selectedSurgery = surgeryService;

          // Patch form with the display format if surgery service found
          const displayName = surgeryService ?
            this.formatSurgeryDisplay(surgeryService) :
            pack.name;

          this.packageForm.patchValue({
            name: displayName,  // Use formatted display name
            type: pack.type || '',
            note: pack.note || '',
            totalPrice: pack.totalPrice,
            duration: pack.duration,
            status: pack.status,
            breakdown: patchB
          });
        });

        // Rest of your existing code...
        this.roomWiseBreakdown.clear();
        (pack.roomWiseBreakdown || []).forEach((room: any) => {
          this.roomWiseBreakdown.push(this.fb.group({
            roomTypeId: [room.roomTypeId, Validators.required],
            roomName: [{ value: room.roomName, disabled: true }],
            roomDescription: [{ value: room.roomDescription, disabled: true }],
            roomPrice: [{ value: room.roomPrice, disabled: true }],
            packagePrice: [room.packagePrice, [Validators.required, Validators.min(0)]],
            drCharge: [room.drCharge || 0, [Validators.min(0)]],
            anesthesia: [room.anesthesia || 0, [Validators.min(0)]],
            ot: [room.ot || 0, [Validators.min(0)]],
            assistant: [room.assistant || 0, [Validators.min(0)]],
            consumables: [room.consumables || 0, [Validators.min(0)]]
          }));
        });

        this.packageBreakdownEnabled = !!(pack.breakdown && pack.breakdown.length);
        this.roomBreakdownEnabled = !!(pack.roomWiseBreakdown && pack.roomWiseBreakdown.length);
      }
    }
  });
}

// Helper method to find surgery service by name
async findSurgeryServiceByName(name: string): Promise<any> {
  try {
    const result = await this.masterService.getSurgerymaster(1, 100, name).toPromise();
    const services = result?.services || [];
    return services.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
  } catch (error) {
    console.error('Error finding surgery service:', error);
    return null;
  }
}

// Helper method to format surgery display
formatSurgeryDisplay(surgery: any): string {
  const category = Array.isArray(surgery.category)
    ? surgery.category.join(", ")
    : surgery.category || '';
  return `${surgery.name} | ${surgery.amount} | ${category}`;
}


  get hasInvalidRooms(): boolean {
    return this.roomBreakdownEnabled && this.roomWiseBreakdown && this.roomWiseBreakdown.controls && this.roomWiseBreakdown.controls.some(ctrl => ctrl && ctrl.invalid);
  }
  async onFileSelected(event: any) {
    const Swal = (await import('sweetalert2')).default;
    const file: File = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
    } else {
      Swal.fire('Invalid File', 'Please upload a valid CSV file.', 'error');
      this.selectedFile = null;
    }
  }
  async uploadCSV() {
    const Swal = (await import('sweetalert2')).default;
    if (!this.selectedFile) {
      Swal.fire('No File', 'Please select a CSV file to upload.', 'warning');
      return;
    }
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.isSubmitting = true;
    this.service.uploadSurgeryCSV(formData).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Bulk Surgery Packages Uploaded',
          text: `Bulk Surgery packages have been uploaded successfully.`,
          position: 'top-end',
          toast: true,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: 'hospital-toast-popup',
            title: 'hospital-toast-title',
            htmlContainer: 'hospital-toast-text',
          }
        });
        this.router.navigate(['/master/surgerypackagemasterlist']);
        this.selectedFile = null;
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: error?.error?.message || 'Something went wrong while bulk uploading the Surgery packages.',
          customClass: {
            popup: 'hospital-swal-popup',
            title: 'hospital-swal-title',
            htmlContainer: 'hospital-swal-text',
            confirmButton: 'hospital-swal-button'
          }
        });
      }
    });
  }

  onNameFocus() {
  this.showSurgeryDropdown = true;
}
onNameBlur() {
  setTimeout(() => this.showSurgeryDropdown = false, 200);
}
isArray(val: any): boolean {
  return Array.isArray(val);
}
}
