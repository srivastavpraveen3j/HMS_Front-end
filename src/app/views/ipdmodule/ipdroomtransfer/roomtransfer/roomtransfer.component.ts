import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  switchMap,
} from 'rxjs';
import { of } from 'rxjs';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { BedwardroomService } from '../../../mastermodule/bedmanagement/bedservice/bedwardroom.service';
import { IpdService } from '../../ipdservice/ipd.service';

@Component({
  selector: 'app-roomtransfer',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './roomtransfer.component.html',
  styleUrl: './roomtransfer.component.css',
})
export class RoomtransferComponent {
  roomtransfer: FormGroup;
  wards: any[] = [];
  filteredPatients: any[] = [];
  showSuggestions = false;
  manuallySelected = false;

  // Current and Transfer sections
  selectedRoomsCurrent: any[] = [];
  selectedBedsCurrent: any[] = [];
  selectedBedCurrent: any = null;

  selectedRoomsTransfer: any[] = [];
  selectedBedsTransfer: any;
  selectedBedTransfer: any = null;
  ipdId: string = '';
  user: string = '';
  startTime: string = '';
  primaryRoomCharge: any = '';
  primaryBedCharge: any = '';

  ipdAdmissions: any[] = []; // Populated from API
  userPermissions: any = {};
  activeRoomCharge: Boolean = false;
  activeBedCharge: Boolean = false;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private uhidService: UhidService,
    private router: Router,
    private route: ActivatedRoute,
    private bedwardroomservice: BedwardroomService,
    private ipdservice: IpdService
  ) {
    this.roomtransfer = this.fb.group({
      uhid: ['', Validators.required],
      inpatientCaseId: [''],
      patient_name: ['', Validators.required],
      age: ['', Validators.required],
      transferStartTime: ['', Validators.required],
      transferEndTime: [''],
      roomCharge: [0],
      bedCharge: [0],
      transferType: ['', Validators.required],
      transferReason: ['', Validators.required],
      remark: [''],

      //primary
      primaryWard: [''],
      primaryRoom: [''],
      primaryBed: [''],

      // current
      currentWard: [''],
      currentRoom: [''],
      currentBed: [''],

      // transfer
      transferWard: ['', Validators.required],
      transferRoom: ['', Validators.required],
      transferBed: ['', Validators.required],
      transferredBy: [''],
      isActiveRoomCharge: [false],
      isActiveBedCharge: [false],
    });
  }

  ngOnInit() {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'inpatientRoomTransfer'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    const userStr = JSON.parse(localStorage.getItem('authUser') || '[]');
    this.user = userStr._id;
    // Load wards
    this.masterService.getWardmasterUrl().subscribe((res) => {
      this.wards = res.wardMasters;
    });

    this.route.queryParams.subscribe((params) => {
      const ipdid = params['Id'];
      const transferId = params['_Id'];
      if (ipdid) {
        this.ipdId = ipdid;
        this.patientFromCase(ipdid);
      } else if (transferId) {
        this.isEditMode = true;
        this.editTransfer(transferId);
      }
    });

    this.loadCompanyRates(this.ipdId);

    const start = new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);
    this.startTime = start;

    // Patient search by name
    this.roomtransfer
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((name: string) =>
          this.manuallySelected || !name || name.length <= 2
            ? of({ inpatientCases: [] })
            : this.ipdservice.getIPDCaseByPatientName(name)
        )
      )
      .subscribe((res: any) => {
        if (this.manuallySelected) return;
        this.filteredPatients = res?.inpatientCases || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // Patient search by UHID
    this.roomtransfer
      .get('uhid')
      ?.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: string) =>
          !value || value.length <= 2 || this.manuallySelected
            ? of({ inpatientCases: [] })
            : this.ipdservice.getPatientByUhid({ uhid: value })
        )
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.data?.inpatientCases || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    this.roomtransfer
      .get('isActiveRoomCharge')
      ?.valueChanges.subscribe((val) => {
        this.activeRoomCharge = val === true ? true : false;
      });

    this.roomtransfer
      .get('isActiveBedCharge')
      ?.valueChanges.subscribe((val) => {
        this.activeBedCharge = val === true ? true : false;
      });
  }

  ward: string = '';
  room: string = '';
  bed: string = '';
  wardId: string = '';
  roomId: string = '';
  bedId: string = '';
  roomCharge: any;
  bedCharge: any;
  admitDate: any;
  transferward: string = '';
  transferroom: string = '';
  transferbed: string = '';
  isCashless: Boolean = false;
  // Select patient from suggestions
  selectPatient(patient: any) {
    console.log('selected patient', patient);
    this.manuallySelected = true;
    this.roomtransfer.patchValue({
      uhid: patient.uniqueHealthIdentificationId?.uhid || '',
      patient_name: patient.uniqueHealthIdentificationId?.patient_name || '',
      age: patient.uniqueHealthIdentificationId?.age || '',
      currentBed: patient?.bed_id?.bed_number || '',
      currentRoom: patient?.room_id?.roomNumber || '',
      currentWard: patient?.wardMasterId?.ward_name || '',
      inpatientCaseId: patient._id,
    });
    this.showSuggestions = false;
    this.filteredPatients = [];

    this.ward = patient.wardMasterId?.ward_name;
    this.wardId = patient.wardMasterId?._id;
    this.room = patient.room_id?.roomNumber;
    this.roomId = patient.room_id?._id;
    this.bed = patient.bed_id?.bed_number;
    const isCashless = patient.patient_type === 'cashless';
    this.isCashless = isCashless;

    if (isCashless) {
      // Cashless only → Locked rates
      this.primaryBedCharge =
        this.companyRates?.lockedBedTypeRates?.find(
          (b: any) => b.bedTypeName === patient.bed_id?.bed_type_id?.name
        )?.lockedRate || 0;

      this.primaryRoomCharge =
        this.companyRates?.lockedRoomTypeRates?.find(
          (r: any) => r.roomTypeName === patient.room_id?.room_type_id?.name
        )?.lockedRate || 0;
    } else {
      this.primaryRoomCharge = patient.room_id?.room_type_id?.price_per_day;
      this.primaryBedCharge = patient.bed_id?.bed_type_id?.price_per_day;
    }
    this.bedId = patient.bed_id?._id;
    this.admitDate = patient.admissionDate;
  }

  patientFromCase(id: string) {
    this.ipdservice.getIPDcaseById(id).subscribe({
      next: (res) => {
        const patient = res.data || res;
        this.selectPatient(patient);
      },
      error: (err) => {
        console.error('Error loading IPD case', err);
      },
    });
  }

  onPatientInput() {
    if (
      this.manuallySelected &&
      !this.roomtransfer.get('patient_name')?.value
    ) {
      this.manuallySelected = false;
    }
  }

  hideSuggestionsWithDelay() {
    setTimeout(() => (this.showSuggestions = false), 200);
  }

  // Ward → Room → Bed cascade
  transferWardId: string = '';
  transferRoomId: string = '';
  transferBedId: string = '';
  selectedward: any;
  onWardSelected(event: Event, section: 'current' | 'transfer') {
    const wardId = (event.target as HTMLSelectElement).value;
    const ward = this.wards.find((w) => w._id === wardId);
    this.selectedward = ward;

    if (!ward) {
      // Reset everything if no ward is selected
      this.selectedRoomsTransfer = [];
      this.selectedBedsTransfer = [];
      this.selectedBedTransfer = null;
      this.transferWardId = '';
      this.transferRoomId = '';
      this.transferBedId = '';
      this.roomtransfer.reset();
      return;
    }

    this.transferWardId = ward._id;

    if (section === 'current') {
      this.selectedRoomsCurrent = ward?.room_id || [];
      this.selectedBedsCurrent = [];
      this.selectedBedCurrent = null;
      this.roomtransfer.patchValue({ currentRoom: '', currentBed: '' });
    } else {
      // Filter rooms with at least one available bed
      const rooms = ward?.room_id || [];
      const availableRooms = rooms.filter((r: any) =>
        r.bed_id.some((b: any) => b.is_occupied !== true)
      );

      this.selectedRoomsTransfer = availableRooms;
      this.transferward = ward.ward_name;

      // 🔥 Reset transfer selections to prevent showing old data
      this.selectedBedsTransfer = [];
      this.selectedBedTransfer = null;
      this.transferRoomId = '';
      this.transferBedId = '';
      this.transferroom = '';
      this.transferbed = '';
      this.roomCharge = null;
      this.bedCharge = null;

      this.roomtransfer.patchValue({ transferRoom: '', transferBed: '' });
    }
  }

  onRoomSelected(event: Event, section: 'current' | 'transfer') {
    const roomId = (event.target as HTMLSelectElement).value;
    const roomList =
      section === 'current'
        ? this.selectedRoomsCurrent
        : this.selectedRoomsTransfer;
    const room = roomList.find((r) => r._id === roomId);
    console.log('selected room', room);
    this.transferroom = room.roomNumber;
    this.transferRoomId = room._id;

    if (section === 'current') {
      this.selectedBedsCurrent = room?.bed_id || [];
      this.roomtransfer.patchValue({ currentBed: '' });
    } else {
      this.selectedBedsTransfer = room.bed_id;
      if (this.isCashless) {
        this.roomCharge =
          this.companyRates?.lockedRoomTypeRates?.find(
            (r: any) => r.roomTypeName === room?.room_type_id?.name
          )?.lockedRate || 0;
      }
      // else if (this.activeRoomCharge) {
      //   this.roomCharge = room.room_type_id?.price_per_day;
      // }
      else {
        this.roomCharge = room.room_type_id?.price_per_day;
      }
      this.roomtransfer.patchValue({ transferBed: '' });
    }
  }

  onBedSelected(bed: any, section: 'current' | 'transfer') {
    if (bed.is_occupied) return;
    this.selectedBedTransfer = bed;
    console.log('selected bed', bed);
    if (section === 'current') {
      this.selectedBedCurrent = bed;
      this.roomtransfer.patchValue({ currentBed: bed._id });
    } else {
      this.roomtransfer.patchValue({ transferBed: bed.bed_number });
      if (this.isCashless) {
        this.bedCharge =
          this.companyRates?.lockedBedTypeRates?.find(
            (b: any) => b.bedTypeName === bed?.bed_type_id?.name
          )?.lockedRate || 0;
      }
      // else if (this.activeBedCharge) {
      //   this.bedCharge = bed.bed_type_id?.price_per_day;
      // }
      else {
        this.bedCharge = bed.bed_type_id?.price_per_day;
      }
      this.transferBedId = bed._id;
      this.transferbed = bed.bed_number;
    }
  }

  isEditMode: boolean = false;
  editTransfer(id: string) {
    this.ipdservice.getIpdRoomTransferById(id).subscribe({
      next: (res) => {
        const transferData = res;
        console.log('room transfer by id', res);

        this.manuallySelected = true;
        this.roomtransfer.patchValue({
          uhid: transferData.inpatientCaseId?.uniqueHealthIdentificationId
            ?.uhid,
          patient_name:
            transferData.inpatientCaseId?.uniqueHealthIdentificationId
              ?.patient_name,
          age: transferData.inpatientCaseId?.uniqueHealthIdentificationId?.age,

          // Primary Bed (read-only fields)
          primaryWard: transferData.primaryBed?.wardName,
          primaryRoom: transferData.primaryBed?.roomNumber,
          primaryBed: transferData.primaryBed?.bedNumber,

          // Current Bed
          currentWard: transferData.currentBed?.wardName,
          currentRoom: transferData.currentBed?.roomNumber,
          currentBed: transferData.currentBed?.bedNumber,
        });
      },
      error: (err) => {
        console.error('Error loading room transfer by id', err);
      },
    });
  }

  getPatientNameForBed(bedId: string): string {
    const admission = this.ipdAdmissions.find(
      (adm) => adm.bed_id._id === bedId
    );
    return admission?.patient_name || 'Unassigned';
  }

  companyRates: any;
  // ✅ Update your loadCompanyRates method to set default tab
  loadCompanyRates(ipdid: string): void {
    this.ipdservice.getCompanyLockedRates(ipdid).subscribe({
      next: (response) => {
        this.companyRates = response.data;
        console.log('✅ Company rates loaded:', this.companyRates);
      },
      error: (error) => {
        console.error('❌ Error loading company rates:', error);
      },
    });
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;
    if (this.roomtransfer.invalid) {
      this.roomtransfer.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields before submitting.',
      });
      return;
    }

    const formdata = this.roomtransfer.value;
    // Determine whether to include charges based on checkboxes
    const includeRoomCharge = formdata.isActiveRoomCharge === true;
    const includeBedCharge = formdata.isActiveBedCharge === true;

    // Calculate old bed charges for permanent transfer
    let oldRoomCharge = 0;
    let oldBedCharge = 0;

    const updatePayload = {
      wardMasterId: this.transferWardId,
      room_id: this.transferRoomId,
      bed_id: this.transferBedId,
    };

    if (formdata.transferType === 'permanent') {
      const start = new Date(this.admitDate);
      const end = new Date(formdata.transferStartTime);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log('days stayed', diffDays);

      oldRoomCharge = this.primaryRoomCharge * diffDays;
      console.log('old room charge', oldRoomCharge);
      oldBedCharge = this.primaryBedCharge * diffDays;
      console.log('old bed charge', oldBedCharge);

      // Update IPD Case
      await firstValueFrom(
        this.ipdservice.updateIPDcase(this.ipdId, updatePayload)
      );

      // Free old bed if changed
      const newBedId = this.transferBedId;
      if (this.bedId && this.bedId !== newBedId) {
        await firstValueFrom(
          this.bedwardroomservice.updatebed(this.bedId, {
            is_occupied: false,
          })
        );
      }

      // if (newBedId) {
      //   await firstValueFrom(
      //     this.bedwardroomservice.updatebed(newBedId, { is_occupied: true })
      //   );
      // }

      Swal.fire({
        icon: 'success',
        title: 'IPD Case Updated',
        text: 'Patient bed updated successfully.',
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
    }

    // Use zero if the charge inclusion checkbox is false, otherwise use current charges or calculated old charges
    const finalRoomCharge =
      formdata.transferType === 'permanent'
        ? oldRoomCharge
        : includeRoomCharge
        ? this.roomCharge || 0
        : 0;

    const finalBedCharge =
      formdata.transferType === 'permanent'
        ? oldBedCharge
        : includeBedCharge
        ? this.bedCharge || 0
        : 0;

    let primaryBed = {
      wardId: this.wardId,
      wardName: this.ward,
      roomId: this.roomId,
      roomNumber: this.room,
      bedId: this.bedId,
      bedNumber: this.bed,
      originalRoomCharge: this.roomCharge,
      originalBedCharge: this.bedCharge,
      roomCharge: this.primaryRoomCharge,
      bedCharge: this.primaryBedCharge,
      assignedDate: this.admitDate,
    };

    let currentBed = {
      wardId: this.transferWardId,
      wardName: this.transferward,
      roomId: this.transferRoomId,
      roomNumber: this.transferroom,
      bedId: this.transferBedId,
      bedNumber: this.transferbed,
      originalRoomCharge: this.roomCharge,
      originalBedCharge: this.bedCharge,
      roomCharge: finalRoomCharge,
      bedCharge: finalBedCharge,
      assignedDate: formdata.transferStartTime,
    };

    if (formdata.transferType === 'permanent') {
      // For permanent transfer, primaryBed switches to new bed as well
      primaryBed = {
        ...currentBed,
        assignedDate: formdata.transferStartTime,
      };
    }

    const payload = {
      inpatientCaseId: this.ipdId,
      primaryBed,
      currentBed,
      transfers: [
        {
          from: {
            wardId: this.wardId,
            wardName: this.ward,
            roomId: this.roomId,
            roomNumber: this.room,
            bedId: this.bedId,
            bedNumber: this.bed,
            originalRoomCharge: this.roomCharge,
            originalBedCharge: this.bedCharge,
          },
          to: {
            wardId: this.transferWardId,
            wardName: this.transferward,
            roomId: this.transferRoomId,
            roomNumber: this.transferroom,
            bedId: this.transferBedId,
            bedNumber: this.transferbed,
            originalRoomCharge: this.roomCharge,
            originalBedCharge: this.bedCharge,
          },
          transferStartTime: formdata.transferStartTime,
          transferEndTime:
            formdata.transferType === 'permanent'
              ? this.startTime
              : formdata.transferEndTime,

          // Charge Tracking
          roomCharge: finalRoomCharge,
          bedCharge: finalBedCharge,
          transferType: formdata.transferType, // e.g., ICU, Semi-care
          transferReason: formdata.transferReason,
          remark: formdata.remark,
          transferredBy: this.user,
        },
      ],
    };

    const transferPayload = {
      from: {
        wardId: this.wardId,
        wardName: this.ward,
        roomId: this.roomId,
        roomNumber: this.room,
        bedId: this.bedId,
        bedNumber: this.bed,
        originalRoomCharge: this.roomCharge,
        originalBedCharge: this.bedCharge,
      },
      to: {
        wardId: this.transferWardId,
        wardName: this.transferward,
        roomId: this.transferRoomId,
        roomNumber: this.transferroom,
        bedId: this.transferBedId,
        bedNumber: this.transferbed,
        originalRoomCharge: this.roomCharge,
        originalBedCharge: this.bedCharge,
      },
      transferStartTime: formdata.transferStartTime,
      transferEndTime: formdata.transferEndTime,
      roomCharge: finalRoomCharge,
      bedCharge: finalBedCharge,
      transferType: formdata.transferType,
      transferReason: formdata.transferReason,
      remark: formdata.remark,
      transferredBy: this.user,
    };

    // Always occupy new bed for both permanent and temporary
    const newBedId = this.transferBedId;
    if (newBedId) {
      await firstValueFrom(
        this.bedwardroomservice.updatebed(newBedId, { is_occupied: true })
      );
    }

    // In your component, before saving the transfer:
    this.ipdservice.getIpdRoomTransferByCase(this.ipdId).subscribe({
      next: (res) => {
        console.log('resposne from onsubmit', res);
        if (!res) {
          // FIRST ADMISSION: No parent transfer found, use POST!

          this.ipdservice.postipdroomtransfer(payload).subscribe({
            next: (res) => {
              Swal.fire({
                icon: 'success',
                title: 'IPD Room transferred',
                text: 'Patient bed transferred successfully.',
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
              if (res?.inpatientCaseId) {
                this.router.navigate(['/ipdpatientsummary'], {
                  queryParams: { id: res?.inpatientCaseId },
                });
              } else {
                this.router.navigate(['/ipdpatientsummary']);
              }
            },

            error: (err) => {
              Swal.fire(
                'Error',
                err?.error?.message || 'Failed to save log room transfer',
                'error'
              );
            },
          });
        } else {
          // SUBSEQUENT transfer, parent exists, use PATCH with parent _id!
          this.ipdservice.addNewTransfer(res._id, transferPayload).subscribe({
            next: (res) => {
              console.log('response from add new transfer', res);
              Swal.fire({
                icon: 'success',
                title: 'IPD Room transferred',
                text: 'Patient bed transferred successfully.',
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
              if (this.ipdId) {
                this.router.navigate(['/ipdpatientsummary'], {
                  queryParams: { id: this.ipdId },
                });
              } else {
                this.router.navigate(['/ipdpatientsummary']);
              }
            },
            error: (err) => {
              console.error('Error adding new transfer log', err);
            },
          });
        }
      },
      error: (err) => {
        if (err.status === 404) {
          // No record found - treat as first admission, continue POST
          this.ipdservice.postipdroomtransfer(payload).subscribe({
            next: (res) => {
              Swal.fire({
                icon: 'success',
                title: 'IPD Room transferred',
                text: 'Patient bed transferred successfully.',
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
              if (res?.inpatientCaseId) {
                this.router.navigate(['/ipdpatientsummary'], {
                  queryParams: { id: res?.inpatientCaseId },
                });
              } else {
                this.router.navigate(['/ipdpatientsummary']);
              }
            },

            error: (err) => {
              Swal.fire(
                'Error',
                err?.error?.message || 'Failed to save log room transfer',
                'error'
              );
            },
          });
        } else {
          // Other error
          Swal.fire(
            'Error',
            err?.error?.message || 'Failed to check room transfer',
            'error'
          );
        }
      },
    });
  }
}
