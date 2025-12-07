import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { VisitTypeService } from '../service/visit.service';
import { IpdService } from '../../../ipdmodule/ipdservice/ipd.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../../masterservice/master.service';

interface VisitTypeDoctorRate {
  doctorId: string | { _id: string; name: string };
  roomTypeId: string | { _id: string; name: string };
  bedTypeId?: string | { _id: string; name: string };
  roomRate?: number;
  bedRate?: number;
}

interface VisitTypeProcedureService {
  _id: string;
  doctorId: string | { _id: string; name: string };
  roomTypeId: string | { _id: string; name: string };
  bedTypeId?: string | { _id: string; name: string };
  serviceId: { _id: string; name: string; charge: number };
  serviceAmount: number;
}

interface VisitTypeMaster {
  _id: string;
  headName: string;
  visitType: 'visit' | 'procedure';
  doctorRates?: VisitTypeDoctorRate[];
  procedureServices?: VisitTypeProcedureService[];
}

@Component({
  selector: 'app-visit-master-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './visit-master-modal.component.html',
  styleUrls: ['./visit-master-modal.component.css'],
})
export class VisitMasterModalComponent implements OnInit, OnDestroy {
  @Input() inpatientCaseId!: string;
  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() visitCreated = new EventEmitter<any>();

  visitForm!: FormGroup;
  visitTypeEnum = ['visit', 'procedure'];

  filteredHeads: VisitTypeMaster[] = [];
  showSuggestions = false;
  manuallySelected = false;

  // doctorSearchControl = new FormControl('');
  filteredDoctors: any[] = [];
  showDoctorSuggestions = false;

  roomTypeName = '';
  bedTypeName = '';

  patientRoomTypeId?: string;
  patientBedTypeId?: string;
  admittingDoctorId?: string;
  admittingDoctorName = '';
 doctorSearchControl = new FormControl('');

  visitTypes: VisitTypeMaster[] = [];

  availableProcedureServices: VisitTypeProcedureService[] = [];
  selectedServices: {
    serviceId: string;
    name: string;
    quantity: number;
    amount: number;
  }[] = [];

  submitting = false;
  loading = false;

  user!: string;
  doctors: any[] = [];
  currentPage = 1;
  totalPages = 1;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private visitService: VisitTypeService,
    private ipdService: IpdService,
    private route: ActivatedRoute,
    private router: Router,
    private masterService : MasterService
  ) {
    this.createForm();
    const userStr = JSON.parse(localStorage.getItem('authUser') || '{}');
    this.user = userStr?._id || '';
  }

  ngOnInit(): void {
  this.route.queryParams.subscribe((params) => {
    const patientId = params['id'] || params['_id'];
    if (patientId) this.loadPatientAndRoomInfo(patientId);
  });
  this.setupHeadSearch();
  this.setupManualValidators();

  this.doctorSearchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  )
  .subscribe((text: string | null) => {
    if (!this.isManualEntry) return;

    const search = (text || '').trim();
    if (!search) {
      this.filteredDoctors = [];
      return;
    }

    this.currentPage = 1;
    this.loadDoctors(search);
  });

}

selectDoctor(doc: any): void {
  this.visitForm.patchValue({
    manualDoctorId: doc._id,
    manualDoctorName: doc.name,
  });
  this.doctorSearchControl.setValue(
    `${doc.name} ${doc.specialization ? '| ' + doc.specialization : ''} ${doc.experience ? '| ' + doc.experience + ' yrs' : ''}`,
    { emitEvent: false }
  );
  this.showDoctorSuggestions = false;
}

hideDoctorSuggestionsLater(): void {
  setTimeout(() => {
    this.showDoctorSuggestions = false;
  }, 200);
}


loadDoctors(search: string): void {
  const limit = 50;

  this.masterService
    .getDoctor(this.currentPage, limit, search)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res.success && Array.isArray(res.data?.data)) {
        this.doctors = res.data.data;
        this.filteredDoctors = this.doctors; // for dropdown
        this.totalPages = res.data.totalPages;
      } else {
        this.doctors = [];
        this.filteredDoctors = [];
        this.totalPages = 1;
      }
      console.log('🚀 ~ doctors:', this.doctors);
    });
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.visitForm = this.fb.group({
      headName: ['', Validators.required],
      visitTypeMasterId: [''],
      visitType: ['visit', Validators.required],
      noOfVisits: [1, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      originalAmount: [0, [Validators.required, Validators.min(0.01)]],
      remarks: [''],
      isManualEntry: [false],
      manualDoctorName: [''],
      manualDoctorMobile: [''],
      doctorId: ['', Validators.required],
      patient_name: [''],
      age: [''],
      gender: [''],
      uhid: [''],
      inpatientCaseId: [''],
      doctorSearchControl: [''],
      manualDoctorId : [''],
    });
  }

  private setupManualValidators(): void {
    this.visitForm
      .get('isManualEntry')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((manual: boolean) => {
        const vtMaster = this.visitForm.get('visitTypeMasterId');
        if (!vtMaster) return;
        if (manual) {
          vtMaster.clearValidators();
        } else {
          vtMaster.setValidators([Validators.required]);
        }
        vtMaster.updateValueAndValidity();
      });
  }

  private loadPatientAndRoomInfo(patientId: string): void {
    this.ipdService
      .getIPDcaseById(patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = res.data;

          this.admittingDoctorId = data?.admittingDoctorId?._id;
          this.admittingDoctorName = data?.admittingDoctorId?.name || '';

          this.patientRoomTypeId = data?.room_id?.room_type_id?._id;
          this.roomTypeName = data?.room_id?.room_type_id?.name || '';

          this.patientBedTypeId = data?.bed_id?.bed_type_id?._id;
          this.bedTypeName = data?.bed_id?.bed_type_id?.name || '';

          this.visitForm.patchValue({
            patient_name: data?.uniqueHealthIdentificationId?.patient_name,
            uhid: data?.uniqueHealthIdentificationId?.uhid,
            age: data?.uniqueHealthIdentificationId?.age,
            gender: data?.uniqueHealthIdentificationId?.gender,
            inpatientCaseId: data?._id,
          });

          if (!this.isManualEntry && this.admittingDoctorId) {
            this.visitForm.patchValue({
              doctorId: this.admittingDoctorId,
              manualDoctorName: this.admittingDoctorName,
            });
          }
        },
        error: (err) => console.error('Error loading IPD case', err),
      });
  }

  get isManualEntry(): boolean {
    return !!this.visitForm.get('isManualEntry')?.value;
  }

  onManualToggle(): void {
    const manual = this.isManualEntry;

    if (manual) {
      this.visitForm.patchValue({
        visitTypeMasterId: '',
        headName: '',
        doctorId: '',
        manualDoctorName: '',
      });
      this.selectedServices = [];
      this.availableProcedureServices = [];
      this.filteredHeads = [];
    } else {
      if (this.admittingDoctorId) {
        this.visitForm.patchValue({
          doctorId: this.admittingDoctorId,
          manualDoctorName: this.admittingDoctorName,
        });
      }
      this.calculateAmount();
    }
  }

  // manual doctor search
  filterDoctors(term: string): void {
    if (!this.isManualEntry) return;
    const q = (term || '').trim();
    if (!q || q.length < 2) {
      this.filteredDoctors = [];
      return;
    }
    // TODO: call real doctor API here
    this.filteredDoctors = [];
  }



  // head search (auto mode)
  private setupHeadSearch(): void {
    this.visitForm
      .get('headName')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (this.isManualEntry) {
            this.filteredHeads = [];
            this.showSuggestions = false;
            this.manuallySelected = false;
            return of({ visitTypes: [] });
          }

          const term = (value || '').trim();
          if (!term || term.length <= 2) {
            this.filteredHeads = [];
            this.showSuggestions = false;
            this.manuallySelected = false;
            return of({ visitTypes: [] });
          }

          const doctorSearch = this.admittingDoctorName || '';
          return this.visitService.getVisitTypes(1, 10, term, doctorSearch);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res: any) => {
        if (this.isManualEntry) return;
        this.filteredHeads = res?.visitTypes || [];
        this.showSuggestions = this.filteredHeads.length > 0;
      });
  }

  selectHead(head: VisitTypeMaster): void {
    if (this.isManualEntry) return;

    this.manuallySelected = true;
    this.showSuggestions = false;

    const exists = this.visitTypes.find((v) => v._id === head._id);
    if (!exists) {
      this.visitTypes.push(head);
    }

    this.visitForm.patchValue({
      headName: head.headName,
      visitTypeMasterId: head._id,
      visitType: head.visitType,
    });

    if (head.visitType === 'procedure') {
      this.setupProcedureServices(head);
    } else {
      this.availableProcedureServices = [];
      this.selectedServices = [];
    }

    this.calculateAmount();
  }

  private setupProcedureServices(vt: VisitTypeMaster): void {
    if (
      !vt.procedureServices ||
      !this.admittingDoctorId ||
      !this.patientRoomTypeId
    ) {
      this.availableProcedureServices = [];
      this.selectedServices = [];
      return;
    }

    this.availableProcedureServices = vt.procedureServices.filter((ps) => {
      const docId =
        typeof ps.doctorId === 'string' ? ps.doctorId : ps.doctorId._id;
      const roomId =
        typeof ps.roomTypeId === 'string' ? ps.roomTypeId : ps.roomTypeId._id;
      const bedId =
        typeof ps.bedTypeId === 'string' ? ps.bedTypeId : ps.bedTypeId?._id;

      return (
        docId === this.admittingDoctorId &&
        roomId === this.patientRoomTypeId &&
        (!this.patientBedTypeId || bedId === this.patientBedTypeId)
      );
    });

    this.selectedServices = [];
  }

  addService(ps: VisitTypeProcedureService): void {
    if (this.isManualEntry) return;

    const idx = this.selectedServices.findIndex(
      (s) => s.serviceId === ps.serviceId._id
    );
    if (idx > -1) {
      this.selectedServices[idx].quantity += 1;
    } else {
      this.selectedServices.push({
        serviceId: ps.serviceId._id,
        name: ps.serviceId.name,
        quantity: 1,
        amount: ps.serviceAmount,
      });
    }
    this.calculateAmount();
  }

  changeServiceQuantity(idx: number, qty: number): void {
    if (this.isManualEntry) return;
    if (!qty || qty < 1) qty = 1;
    this.selectedServices[idx].quantity = qty;
    this.calculateAmount();
  }

  removeService(index: number): void {
    if (this.isManualEntry) return;
    this.selectedServices.splice(index, 1);
    this.calculateAmount();
  }

  // calculateAmount(): void {
  //   if (this.isManualEntry) {
  //     const amt = this.visitForm.get('amount')?.value || 0;
  //     this.visitForm.patchValue({ originalAmount: amt });
  //     return;
  //   }

  //   const vtId = this.visitForm.get('visitTypeMasterId')?.value;
  //   const noOfVisits = this.visitForm.get('noOfVisits')?.value || 1;

  //   if (!vtId) {
  //     this.visitForm.patchValue({ amount: 0, originalAmount: 0 });
  //     return;
  //   }

  //   const vt =
  //     this.visitTypes.find((x) => x._id === vtId) ||
  //     this.filteredHeads.find((x) => x._id === vtId);

  //   if (!vt) {
  //     this.visitForm.patchValue({ amount: 0, originalAmount: 0 });
  //     return;
  //   }

  //   let total = 0;

  //   if (vt.visitType === 'visit') {
  //     if (!vt.doctorRates || !this.admittingDoctorId || !this.patientRoomTypeId) {
  //       this.visitForm.patchValue({ amount: 0, originalAmount: 0 });
  //       return;
  //     }

  //     const rateRow = vt.doctorRates.find((r) => {
  //       const docId =
  //         typeof r.doctorId === 'string' ? r.doctorId : (r.doctorId as any)._id;
  //       const roomId =
  //         typeof r.roomTypeId === 'string'
  //           ? r.roomTypeId
  //           : (r.roomTypeId as any)._id;

  //       return (
  //         docId === this.admittingDoctorId &&
  //         roomId === this.patientRoomTypeId
  //       );
  //     });

  //     const roomRate = rateRow?.roomRate || 0;
  //     const bedRate = rateRow?.bedRate || 0;
  //     const baseRate = roomRate + bedRate;
  //     total = baseRate * noOfVisits;
  //   } else if (vt.visitType === 'procedure') {
  //     total =
  //       this.selectedServices.reduce(
  //         (sum, s) => sum + s.amount * s.quantity,
  //         0
  //       ) * noOfVisits;
  //   }

  //   this.visitForm.patchValue({
  //     amount: total,
  //     originalAmount: total,
  //   });
  // }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

 calculateAmount(): void {
  if (this.isManualEntry) {
    const amt = this.visitForm.get('amount')?.value || 0;
    this.visitForm.patchValue({ originalAmount: amt });
    return;
  }

  const vtId = this.visitForm.get('visitTypeMasterId')?.value;
  const noOfVisits = this.visitForm.get('noOfVisits')?.value || 1;

  if (!vtId) {
    this.visitForm.patchValue({ amount: 0, originalAmount: 0 });
    return;
  }

  const vt =
    this.visitTypes.find((x) => x._id === vtId) ||
    this.filteredHeads.find((x) => x._id === vtId);

  if (!vt) {
    this.visitForm.patchValue({ amount: 0, originalAmount: 0 });
    return;
  }

  let total = 0;

  if (vt.visitType === 'visit') {
    if (!vt.doctorRates || !this.admittingDoctorId || !this.patientRoomTypeId) {
      this.visitForm.patchValue({ amount: 0, originalAmount: 0 });
      return;
    }

    const rateRow = vt.doctorRates.find((r) => {
      const docId =
        typeof r.doctorId === 'string' ? r.doctorId : (r.doctorId as any)._id;
      const roomId =
        typeof r.roomTypeId === 'string'
          ? r.roomTypeId
          : (r.roomTypeId as any)._id;

      return (
        docId === this.admittingDoctorId &&
        roomId === this.patientRoomTypeId
      );
    });

    const roomRate = rateRow?.roomRate || 0;
    const bedRate = rateRow?.bedRate || 0;
    const baseRate = roomRate + bedRate;
    total = baseRate * noOfVisits;
  } else if (vt.visitType === 'procedure') {
    total =
      this.selectedServices.reduce(
        (sum, s) => sum + s.amount * s.quantity,
        0
      ) * noOfVisits;
  }

  this.visitForm.patchValue({
    amount: total,
    originalAmount: total,
  });
}

submitVisit(): void {
  this.submitting = true;

  // always sync originalAmount with amount before sending
  const currentAmount = this.visitForm.get('amount')?.value || 0;
  this.visitForm.patchValue({ originalAmount: currentAmount });

  const payload = {
    ...this.visitForm.value,
    inpatientCaseId: this.visitForm.value.inpatientCaseId,
    doctorId: this.visitForm.value.doctorId,
    manualDoctorId: this.visitForm.value.manualDoctorId,
    selectedServices: this.selectedServices.map((s) => ({
      serviceId: s.serviceId,
      quantity: s.quantity,
    })),
    createdBy: this.user,
  };

  this.visitService
    .createVisitMaster(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.submitting = false;
        this.visitCreated.emit(res);
        this.router.navigate(['/ipdpatientsummary'], {
          queryParams: {
            id:
              res?.inpatientCaseId ||
              res.visitMasters?.inpatientCaseId,
          },
        });
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creating visit:', err);
      },
    });
}

  close(): void {
    this.showModal = false;
    this.closeModal.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.visitForm.reset({
      headName: '',
      visitTypeMasterId: '',
      visitType: 'visit',
      noOfVisits: 1,
      amount: 0,
      originalAmount: 0,
      remarks: '',
      isManualEntry: false,
      manualDoctorName: this.admittingDoctorName,
      doctorId: this.admittingDoctorId,
    });
    this.filteredHeads = [];
    this.showSuggestions = false;
    this.selectedServices = [];
  }

  get f() {
    return this.visitForm.controls;
  }

  onVisitTypeChange(): void {
    if (!this.isManualEntry) {
      this.calculateAmount();
    }
  }
}
