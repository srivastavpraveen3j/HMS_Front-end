import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { VisitTypeService } from '../service/visit.service';
import { RoleService } from '../../usermaster/service/role.service';
import { BedwardroomService } from '../../bedmanagement/bedservice/bedwardroom.service';
import { MasterService } from '../../masterservice/master.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { IndianCurrencyPipe } from '../../../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-visittypemaster',
  templateUrl: './visittypemaster.component.html',
  styleUrls: ['./visittypemaster.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    IndianCurrencyPipe,
  ],
})
export class VisittypemasterComponent implements OnInit {
  visitTypeForm!: FormGroup;

  doctors: any[] = [];
  roomTypes: any[] = [];
  bedTypes: any[] = [];
  services: any[] = [];

  visitTypesList: any[] = [];
  currentPage = 1;
  limit = 30;
  totalPages = 0;
  searchText = '';

  visitTypeEnum = ['visit', 'procedure'];
  statusEnum = ['active', 'inactive'];
  userPermissions: any = {};
  previewTimer: any = null;

  roomTypeSearchText = '';
  bedTypeSearchText = '';
  searchTextControl = new FormControl('');

  doctorSearchControl = new FormControl('');
  showDoctorSuggestions = false;
  filteredDoctors: any[] = [];
  selectedDoctorIndex = -1;

  patientId: string = '';

  roomCharges: { [roomId: string]: number } = {};
  chargePreview: string[] = [];

  editMode = false;
  currentVisitTypeId: string | null = null;

  // serviceId -> base service charge
  serviceAmountMap: { [serviceId: string]: number } = {};

  saving = false; // prevent double submit and pagination during save

  constructor(
    private visitTypeService: VisitTypeService,
    private fb: FormBuilder,
    private userservice: RoleService,
    private bedwardroomservice: BedwardroomService,
    private masterservice: MasterService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.loadVisitTypes();

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'visittypemaster'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.searchTextControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadService();
      });

    this.doctorSearchControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((name: string | null) => {
          if (name && name.trim().length >= 1) {
            return this.userservice.getusers(1, 100, name.trim());
          }
          return of([]);
        })
      )
      .subscribe((users: any) => {
        const list = Array.isArray(users) ? users : users || [];
        this.filteredDoctors = list.filter(
          (u: any) => u.role?.name === 'doctor'
        );
        this.cdr.detectChanges();
      });

    this.visitTypeForm.get('roomRates')?.valueChanges.subscribe(() => {
      this.updateRoomCombinations();
    });

    this.route.queryParams.subscribe((params) => {
      const visittypemasterid = params['_id'];
      if (visittypemasterid) {
        this.editMode = true;
        this.currentVisitTypeId = visittypemasterid;
        this.loadVisitTypeMaster(visittypemasterid);
      } else {
        this.editMode = false;
        this.currentVisitTypeId = null;
      }
    });
  }

  initForm() {
    this.visitTypeForm = this.fb.group({
      _id: [''],
      headName: ['', Validators.required],
      visitType: ['visit', Validators.required],
      status: ['active', Validators.required],
      allDrPercent: [0, [Validators.min(0), Validators.max(100)]],
      doctorId: ['', Validators.required],
      roomRates: this.fb.array([]),
      bedRates: this.fb.array([]),
      procedureServices: this.fb.array([]),
    });
  }

  onServiceAmountInput() {
  // debounce preview to avoid fighting with typing
  if (this.previewTimer) {
    clearTimeout(this.previewTimer);
  }
  this.previewTimer = setTimeout(() => {
    this.updateChargePreview();
  }, 300); // 300 ms after last key
}

  get roomRates(): FormArray {
    return this.visitTypeForm.get('roomRates') as FormArray;
  }

  get bedRates(): FormArray {
    return this.visitTypeForm.get('bedRates') as FormArray;
  }

  get procedureServices(): FormArray {
    return this.visitTypeForm.get('procedureServices') as FormArray;
  }

  // 3‑per‑row view helper
  get procedureServiceRows() {
    const rows: { index: number; control: FormGroup }[][] = [];
    const controls = this.procedureServices.controls as FormGroup[];
    for (let i = 0; i < controls.length; i += 3) {
      const row: { index: number; control: FormGroup }[] = [];
      for (let j = 0; j < 3 && i + j < controls.length; j++) {
        row.push({ index: i + j, control: controls[i + j] });
      }
      rows.push(row);
    }
    return rows;
  }

  getEmptyCells(rowLength: number): number[] {
    return Array(3 - rowLength).fill(0);
  }

  updateRoomCombinations() {
    this.roomCharges = {};
    const roomRates = this.roomRates.value || [];
    roomRates.forEach((r: any) => {
      if (r.roomTypeId && r.visitCharge !== undefined && r.visitCharge >= 0) {
        this.roomCharges[r.roomTypeId] = parseFloat(r.visitCharge) || 0;
      }
    });
    this.updateChargePreview();
    this.cdr.detectChanges();
  }

  updateChargePreview() {
    this.chargePreview = [];
    const servicesWithAmount = this.procedureServices.value.filter(
      (p: any) => p.serviceAmount > 0
    );
    const roomRates = this.roomRates.value || [];
    servicesWithAmount.forEach((service: any) => {
      const pureService = Number(service.serviceAmount || 0);
      roomRates.forEach((r: any) => {
        if (!r.roomTypeId) return;
        const roomId = r.roomTypeId;
        const roomCharge = Number(r.visitCharge || 0);
        const finalAmount = pureService + roomCharge;
        const roomName = this.getRoomName(roomId);
        this.chargePreview.push(
          `${service.name} + ${roomName} (₹${roomCharge}) = ₹${finalAmount}`
        );
      });
    });
  }

  getRoomName(roomId: string): string {
    const room = this.roomTypes.find((r) => r._id === roomId);
    return room?.name || roomId;
  }

  selectDoctor(doctor: any) {
    this.visitTypeForm.patchValue({
      doctorId: doctor._id,
    });
    this.doctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showDoctorSuggestions = false;
  }

  hideSuggestionsLater() {
    setTimeout(() => {
      this.showDoctorSuggestions = false;
    }, 200);
  }

  filterDoctors(searchTerm: string): void {
    const term = (searchTerm || '').toLowerCase();
    this.filteredDoctors = (this.doctors || []).filter((doctor: any) => {
      const name =
        doctor && doctor.name ? String(doctor.name).toLowerCase() : '';
      return name.includes(term);
    });
  }

  onVisitTypeChange(): void {
    const type = this.visitTypeForm.get('visitType')?.value;
    if (type === 'procedure') {
      this.currentPage = 1;
      this.loadService();
    }
  }

  private buildRoomRatesFromTypes() {
    this.roomRates.clear();
    this.roomTypes.forEach((rt) => {
      this.roomRates.push(
        this.fb.group({
          roomTypeId: [rt._id],
          visitCharge: [0, Validators.min(0)],
        })
      );
    });
    this.updateRoomCombinations();
  }

  private buildBedRatesFromTypes() {
    this.bedRates.clear();
    this.bedTypes.forEach((bt) => {
      this.bedRates.push(
        this.fb.group({
          bedTypeId: [bt._id],
          visitCharge: [0, Validators.min(0)],
        })
      );
    });
  }

  loadInitialData() {
    this.userservice.getuser(1, 100, '').subscribe((res) => {
      this.doctors = res?.data || res || [];
    });

    this.loadRoomTypes(true);
    this.loadBedTypes(true);
  }

  loadRoomTypes(initial = false) {
    const limit = 1000;
    const search = this.roomTypeSearchText || '';
    this.bedwardroomservice.getroomtype(1, limit, search).subscribe((res) => {
      this.roomTypes = res.roomTypes || res.data || [];
      this.buildRoomRatesFromTypes();
      if (initial && !this.roomTypes.length && this.roomRates.length === 0) {
        this.roomRates.push(
          this.fb.group({
            roomTypeId: [''],
            visitCharge: [0],
          })
        );
      }
      this.cdr.detectChanges();
    });
  }

  loadBedTypes(initial = false) {
    const limit = 1000;
    const search = this.bedTypeSearchText || '';
    this.bedwardroomservice.getbedtype(1, limit, search).subscribe((res) => {
      this.bedTypes = res.data.bedTypes || res.data || [];
      this.buildBedRatesFromTypes();
      if (initial && !this.bedTypes.length && this.bedRates.length === 0) {
        this.bedRates.push(
          this.fb.group({
            bedTypeId: [''],
            visitCharge: [0],
          })
        );
      }
    });
  }

  // save current page service amounts into map (for pagination)
  private saveCurrentServiceAmountsToMap() {
    if (!this.procedureServices?.length) return;
    this.procedureServices.controls.forEach((ctrl: any) => {
      const sid = ctrl.get('serviceId')?.value;
      const amt = Number(ctrl.get('serviceAmount')?.value || 0);
      if (sid != null) {
        this.serviceAmountMap[sid] = amt;
      }
    });
  }

  loadService() {
    if (this.visitTypeForm.get('visitType')?.value !== 'procedure') return;

    // keep values from current page
    this.saveCurrentServiceAmountsToMap();

    const search = this.searchTextControl.value || '';
    this.masterservice
      .getServicess(this.currentPage, this.limit, search, 'ipd')
      .subscribe((res) => {
        this.services = res.services || res.data || [];
        this.totalPages = res.totalPages || 1;
        this.currentPage = res.page || this.currentPage;

        this.rebuildProcedureServices();
        this.cdr.detectChanges();
      });
  }

  // build services from master list and patch existing charges (if any)
  private rebuildProcedureServices() {
    const doctorId = this.visitTypeForm.get('doctorId')?.value || '';

    this.procedureServices.clear();
    this.services.forEach((srv) => {
      const base = this.serviceAmountMap[srv._id] ?? 0;
      this.procedureServices.push(
        this.fb.group({
          doctorId: [doctorId],
          roomTypeId: [null],
          bedTypeId: [null],
          serviceId: [srv._id, Validators.required],
          serviceAmount: [base, [Validators.required, Validators.min(0)]],
          name: [srv.name],
        })
      );
    });

    this.updateChargePreview();
  }

  nextPage() {
    if (this.saving || this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.loadService();
  }

  previousPage() {
    if (this.saving || this.currentPage <= 1) return;
    this.currentPage--;
    this.loadService();
  }

  loadVisitTypes() {
    this.visitTypeService
      .getVisitTypes(this.currentPage, this.limit, this.searchText)
      .subscribe((res) => {
        this.visitTypesList = res.visitTypes || res.data || [];
        this.totalPages = res.totalPages || 0;
        this.currentPage = res.page || this.currentPage;
      });
  }

  loadVisitTypeMaster(visittypeid: string) {
    this.visitTypeService.getVisitTypesById(visittypeid).subscribe({
      next: (res: any) => {
        this.visitTypeForm.patchValue({
          _id: res._id,
          headName: res.headName,
          visitType: res.visitType,
          status: res.status,
          allDrPercent: res.allDrPercent || 0,
          doctorId:
            res.doctorRates?.[0]?.doctorId?._id ||
            res.procedureServices?.[0]?.doctorId?._id ||
            res.doctorRates?.[0]?.doctorId ||
            res.procedureServices?.[0]?.doctorId ||
            '',
        });

        const anyDoc =
          res.doctorRates?.[0]?.doctorId ||
          res.procedureServices?.[0]?.doctorId;
        if (anyDoc?.name) {
          this.doctorSearchControl.setValue(anyDoc.name, { emitEvent: false });
        }

        const roomRateMap: { [roomId: string]: number } = {};
        if (Array.isArray(res.doctorRates)) {
          res.doctorRates.forEach((dr: any) => {
            const roomId = dr.roomTypeId?._id || dr.roomTypeId;
            if (!roomId) return;
            roomRateMap[roomId] = dr.roomRate || 0;
          });
        }

        this.roomRates.clear();
        Object.entries(roomRateMap).forEach(([roomId, rate]) => {
          this.roomRates.push(
            this.fb.group({
              roomTypeId: [roomId],
              visitCharge: [rate, Validators.min(0)],
            })
          );
        });
        if (this.roomRates.length === 0 && this.roomTypes.length) {
          this.buildRoomRatesFromTypes();
        }

        this.bedRates.clear();

        this.serviceAmountMap = {};
        if (
          res.visitType === 'procedure' &&
          Array.isArray(res.procedureServices)
        ) {
          res.procedureServices.forEach((ps: any) => {
            const totalAmount = ps.serviceAmount || 0;
            const roomId = ps.roomTypeId?._id || ps.roomTypeId;
            const roomRate = roomRateMap[roomId] || 0;
            const pure =
              typeof ps.baseServiceCharge === 'number'
                ? ps.baseServiceCharge
                : totalAmount - roomRate;

            const sid = ps.serviceId?._id || ps.serviceId;
            if (sid && this.serviceAmountMap[sid] == null) {
              this.serviceAmountMap[sid] = pure;
            }
          });
        }

        // populate procedureServices for current page
        this.loadService();

        this.updateRoomCombinations();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('loadVisitTypeMaster error:', err);
      },
    });
  }

  async onSubmit() {
  if (this.visitTypeForm.invalid || this.saving) {
    this.visitTypeForm.markAllAsTouched();
    return;
  }

  this.saving = true;

  // capture last page edits
  this.saveCurrentServiceAmountsToMap();

  const fv = { ...this.visitTypeForm.value };
  delete fv._id;

  this.updateRoomCombinations();

  if (fv.visitType === 'visit') {
    fv.doctorRates = this.roomRates.value
      .filter((r: any) => r.roomTypeId)
      .map((r: any) => ({
        doctorId: fv.doctorId,
        roomTypeId: r.roomTypeId,
        bedTypeId: null,
        roomRate: r.visitCharge || 0,
        bedRate: 0,
      }));
    fv.procedureServices = [];
  } else {
    // PROCEDURE
    fv.doctorRates = this.roomRates.value
      .filter((r: any) => r.roomTypeId)
      .map((r: any) => ({
        doctorId: fv.doctorId,
        roomTypeId: r.roomTypeId,
        bedTypeId: null,
        roomRate: r.visitCharge || 0,
        bedRate: 0,
      }));

    const roomRateMap: { [roomId: string]: number } = {};
    this.roomRates.value.forEach((r: any) => {
      if (r.roomTypeId) {
        roomRateMap[r.roomTypeId] = Number(r.visitCharge || 0);
      }
    });

    const procedureServices: any[] = [];
    Object.entries(this.serviceAmountMap).forEach(
      ([serviceId, pureService]) => {
        const base = Number(pureService || 0);
        if (base <= 0) return;

        Object.entries(roomRateMap).forEach(([roomId, roomRate]) => {
          procedureServices.push({
            doctorId: fv.doctorId,
            roomTypeId: roomId,
            bedTypeId: null,
            serviceId,
            baseServiceCharge: base,
            serviceAmount: base + (roomRate as number),
          });
        });
      }
    );

    fv.procedureServices = procedureServices;
  }

  const Swal = (await import('sweetalert2')).default;

  const apiCall =
    this.editMode && this.currentVisitTypeId
      ? this.visitTypeService.updateVisitTypeMaster(this.currentVisitTypeId, fv)
      : this.visitTypeService.createVisitTypeMaster(fv);

  apiCall.subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: this.editMode ? 'Visit Type Updated' : 'Visit Type Saved',
        text: this.editMode
          ? 'Visit type master has been updated successfully.'
          : 'Visit type master has been created successfully.',
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

      this.saving = false;
      this.resetForm();
      this.router.navigateByUrl('/master/visittypemasterlist');
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: this.editMode ? 'Update Failed' : 'Save Failed',
        text:
          err?.error?.message ||
          'There was an error saving visit type master.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
      this.saving = false;
    },
  });
}

  resetForm() {
    this.visitTypeForm.reset({
      _id: '',
      visitType: 'visit',
      status: 'active',
      allDrPercent: 0,
      doctorId: '',
    });
    this.roomRates.clear();
    this.bedRates.clear();
    this.procedureServices.clear();
    this.chargePreview = [];
    this.editMode = false;
    this.currentVisitTypeId = null;
    this.serviceAmountMap = {};
    this.loadRoomTypes(true);
    this.loadBedTypes(true);
    this.loadVisitTypes();
  }

  trackByGroupId(index: number, item: any) {
    return item._id || index;
  }

  trackByServiceId(index: number, item: any) {
    return item._id || index;
  }

  onServiceAmountChange() {
    this.updateChargePreview();
  }
  trackRow(index: number, row: { index: number; control: FormGroup }[]) {
    // row is just 3 controls; use the first control index as stable key
    return row[0]?.index ?? index;
  }
}
