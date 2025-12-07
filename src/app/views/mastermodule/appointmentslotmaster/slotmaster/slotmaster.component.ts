import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SlotmasterService } from '../slotmaster.service';
import { RoleService } from '../../usermaster/service/role.service';

@Component({
  selector: 'app-slotmaster',
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './slotmaster.component.html',
  styleUrl: './slotmaster.component.css',
})
export class SlotmasterComponent {
  slotForm: FormGroup;
  doctors: any[] = [];
  appointmentTypes: any[] = [];
  daysList: string[] = [];
  userPermissions: any = {};
  editMode: boolean = false;

  weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  selectedDays: string[] = [];

  existingSlots: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private slotservice: SlotmasterService,
    private role: RoleService
  ) {
    this.slotForm = fb.group({
      doctor: ['', Validators.required],
      appointmentType: [''],
      timeSlots: this.fb.array([this.createTimeSlotGroup()]),
      // isActive: [false],
    });
  }

  ngOnInit(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'slotMaster'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.slotForm.valueChanges.subscribe(() => {
      this.calculateMaxAppointments();
    });

    const id = this.route.snapshot.queryParamMap.get('id');
    console.log('slot id:', id);
    if (id) {
      this.loadSlot(id);
    }

    this.role.getusers().subscribe({
      next: (data: any) => {
        this.doctors = data.filter((user: any) => user.role?.name === 'doctor');
      },
    });
  }

  createTimeSlotGroup() {
    return this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      slotDuration: ['', Validators.required],
      maxAppointments: ['', Validators.required],
      isActive: [false],
    });
  }

  get timeSlots() {
    return this.slotForm.get('timeSlots') as FormArray;
  }

  addTimeSlot() {
    this.timeSlots.push(this.createTimeSlotGroup());
  }

  removeTimeSlot(index: number) {
    this.timeSlots.removeAt(index);
  }

  slotId: string = '';
  loadSlot(slotid: string) {
    this.slotId = slotid;
    this.slotservice.getSlotById(slotid).subscribe({
      next: (data: any) => {
        console.log('Slot data:', data);
        this.existingSlots = [data];
        this.editMode = true;
        this.slotForm.patchValue({
          doctor: data.doctor?._id,
          appointmentType: data.appointmentType,
          // startTime: data.workingDays[0]?.timeSlots[0]?.startTime,
          // endTime: data.workingDays[0]?.timeSlots[0]?.endTime,
          // slotDuration: data.workingDays[0]?.timeSlots[0]?.slotDuration,
          // maxAppointments: data.workingDays[0]?.timeSlots[0]?.maxAppointments,
          // isActive: data.workingDays[0]?.isAvailable,
        });

        this.timeSlots.clear();

        if (data.workingDays && data.workingDays.length > 0) {
          data.workingDays[0]?.timeSlots.forEach((ts: any) => {
            this.timeSlots.push(
              this.fb.group({
                startTime: ts.startTime,
                endTime: ts.endTime,
                slotDuration: ts.slotDuration,
                maxAppointments: ts.maxAppointments,
                isActive: ts.isAvailable,
              })
            );
          });
        }
        this.selectedDays = data.workingDays.map((day: any) => day.day);
      },
      error: (error: any) => {
        console.error('Error fetching slot:', error);
      },
    });
  }

  toggleDay(day: string, e: any) {
    if (e.target.checked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter((d) => d !== day);
    }
  }

  editSlot(slot: any) {
    console.log('Editing slot:', slot);
  }

  isDaySelected(day: string): boolean {
    return this.selectedDays.includes(day);
  }

  calculateMaxAppointments() {
    this.timeSlots.controls.forEach((slotGroup) => {
      const startTime = slotGroup.get('startTime')?.value;
      const endTime = slotGroup.get('endTime')?.value;
      const slotDuration = +slotGroup.get('slotDuration')?.value || 0;

      if (startTime && endTime && slotDuration > 0) {
        // Convert HH:mm to minutes
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const totalDuration = endMinutes - startMinutes;

        const maxAppointments = Math.floor(totalDuration / slotDuration);

        slotGroup.patchValue(
          { maxAppointments },
          { emitEvent: false } // avoid infinite loop
        );

        // console.log('calculated max appointments', maxAppointments);
      }
    });
  }

  async onSubmit() {
    const Swal = (await import('sweetalert2')).default;
    if (this.slotForm.invalid) {
      this.slotForm.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.slotForm.value,
    };

    // const payload = {
    //   doctor: formData.doctor,
    //   appointmentType: formData.appointmentType,
    //   workingDays: this.selectedDays.map((day) => ({
    //     day,
    //     isAvailable: formData.isActive,
    //     timeSlots: [
    //       {
    //         startTime: formData.startTime,
    //         endTime: formData.endTime,
    //         slotDuration: Number(formData.slotDuration),
    //         maxAppointments: Number(formData.maxAppointments),
    //       },
    //     ],
    //   })),
    //   exceptions: [],
    // };

    const payload = {
      doctor: formData.doctor,
      appointmentType: formData.appointmentType,
      workingDays: this.selectedDays.map((day) => ({
        day,
        timeSlots: formData.timeSlots.map((ts: any) => ({
          startTime: ts.startTime,
          endTime: ts.endTime,
          slotDuration: Number(ts.slotDuration),
          maxAppointments: Number(ts.maxAppointments),
          isAvailable: ts.isActive,
        })),
      })),
      exceptions: [],
    };

    if (this.editMode && this.slotId) {
      this.slotservice.updateSlot(this.slotId, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Slot Updated',
            text: 'Slot updated successfully!',
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
          this.slotForm.reset();
          this.router.navigateByUrl('/master/slotmasterlist');
        },
        error: (error: any) => {
          console.error('Error updating slot:', error);
          let errorMessage = 'Failed to update slot.';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error?.error?.message || 'Slot Update Failed',
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
      this.slotservice.createSlots(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Slot Added',
            text: 'Slot added successfully!',
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
          this.slotForm.reset();
          this.router.navigateByUrl('/master/slotmasterlist');
        },
        error: (error: any) => {
          console.error('Error adding slot:', error);
          let errorMessage = 'Failed to add slot.';
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          }

          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            text: error?.error?.message || 'Slot Creation Failed',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    }
  }
}
