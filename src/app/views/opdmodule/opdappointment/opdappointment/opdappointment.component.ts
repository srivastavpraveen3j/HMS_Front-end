import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomappointmenttimepickerComponent } from '../../../../component/customappointmenttimepicker/customappointmenttimepicker.component';
import { MasterService } from '../../../mastermodule/masterservice/master.service';
import { UhidService } from '../../../uhid/service/uhid.service';
import { OpdService } from '../../opdservice/opd.service';
import { debounceTime, switchMap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { of } from 'rxjs';
// import Swal from 'sweetalert2';
import { distinctUntilChanged } from 'rxjs/operators';
import { RoleService } from '../../../mastermodule/usermaster/service/role.service';
import { SlotmasterService } from '../../../mastermodule/appointmentslotmaster/slotmaster.service';

@Component({
  selector: 'app-opdappointment',
  templateUrl: './opdappointment.component.html',
  styleUrls: ['./opdappointment.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    // Assuming these are standalone components
    ReactiveFormsModule,
    FormsModule,
    CustomappointmenttimepickerComponent,
  ],
})
export class OpdappointmentComponent {
  appointmentForm: FormGroup;
  appointments: any[] = [];
  doctors: any = [];
  manuallySelected = false;
  filteredPatients: any[] = [];
  showSuggestions = false;
  editMode = false;
  Appointmentid: string | null = null;
  activeFilter: 'today' | 'dateRange' = 'today';
  dropdownOpen = false;
  hours: string[] = [];
  minutes: string[] = [];
  selectedHour: string = '';
  selectedMinute: string = '';
  consultationStartTime: string = '';
  consultationEndTime: string = '';
  timeSlot: string = '';
  checkinTime: string = '';
  timeSlots: string[] = [];
  patientId: string = '';
  bookedSlots: string[] = [];
  appointmentTime: string[] = [];
  selectedDoctor: any = null;
  bookedTimeSlots: any[] = [];
  isLoadingSlots = false;
  freeSlots: any[] = [];
  ALL_SLOTS: any[] = [];
  selectedDate: string = '';
  Filteredappointments: any[] = [];
  userPermissions: any = {};
  doctorSearchControl = new FormControl('');
  filteredDoctors: any[] = [];
  showDoctorSuggestions = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private masterService: MasterService,
    private uhidService: UhidService,
    private opdservice: OpdService,
    private route: ActivatedRoute,
    private role: RoleService,
    private slotservice: SlotmasterService
  ) {
    const now = new Date();
    this.appointmentForm = this.fb.group({
      patient_name: ['', Validators.required],
      Consulting_Doctor: [''],
      mobile_no: [
        '',
        [Validators.pattern(/^[6-9]\d{9}$/), Validators.required],
      ],
      emailAddress: ['', [Validators.email]],
      remarks: [''],
      status: ['', Validators.required],
      date: [this.formatDate(now), Validators.required],
      token_number: [''],
      department: ['678094536754'],
      branch: ['670976543657'],
      staff_assigned: ['673421098765'],
      payment_status: ['pending'],
      called_by: ['672310954365'],
      queue_status: ['', Validators.required],
      time_slot: [''],
      reschedule_count: [''],
      checkin_time: [''],
      consultation_start: [''],
      consultation_end: [''],
      cancellation_reason: [''],
      source: ['', Validators.required],
      is_followup: [false],
      followup_for: ['654323456786'],
      notes: [''],
      platform_name: [''],
      staffId: [''],
      staff_name: [''],
      doctor_name: [''],
      // uhid
      time: [this.getRoundedTime(now), Validators.required],
      uhid: [''],
      gender: [''],
      dob: ['', Validators.required],
      age: [''],
      caseType: [''],
      dot: [this.formatTime(now)],
      dor: [this.formatDate(now)],
      // mobile_no: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      area: [''],
      pincode: ['', [Validators.pattern(/^[1-9][0-9]{5}$/)]],
    });
  }

  preventTyping(event: KeyboardEvent): void {
    event.preventDefault();
  }

  getRoundedTime(date: Date): string {
    const minutes = date.getMinutes();
    const rounded = Math.round(minutes / 5) * 5;
    const hours = rounded === 60 ? (date.getHours() + 1) % 24 : date.getHours();
    const adjustedMinutes = rounded === 60 ? 0 : rounded;
    return `${hours.toString().padStart(2, '0')}:${adjustedMinutes
      .toString()
      .padStart(2, '0')}`;
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.role.getusers().subscribe((users) => {
      console.log('users', users);
    });
    // this.fetchAllAppointments();

    // this.route.queryParamMap.subscribe((params) => {
    //   const appointmentId = params.get('_id');
    //   // console.log(appointmentId);
    //   if (appointmentId) {
    //     this.editMode = true;
    //     this.loadappointment(appointmentId);
    //   }
    // });

    this.appointmentForm.get('dob')?.valueChanges.subscribe((dobValue) => {
      if (dobValue) {
        const { years, months, days } = this.calculateAge(new Date(dobValue));
        this.appointmentForm.get('age')?.setValue(`${years}Y ${months}M ${days}D`);
      }
    });
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'appointment'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions
    // First load doctors
    //  this.masterService.getDoctors().subscribe({
    //   next: (res) => {
    //     this.doctors = res.data.data || [];

    this.route.queryParams.subscribe((params) => {
      this.Appointmentid = params['_id'] || null;
      this.editMode = !!this.Appointmentid;
      console.log('appointment id', this.Appointmentid);

      if (this.editMode && this.Appointmentid) {
        this.loadappointment(this.Appointmentid);
      }
    });

    // });



   this.doctorSearchControl.valueChanges
  .pipe(
    debounceTime(100),
    distinctUntilChanged(),
    switchMap((name: string | null) => {
      if (name && name.trim().length >= 1) {
        // ✅ FIXED: Pass the search term to getusers service
        return this.role.getusers(1, 100, name.trim());
      }
      return of([]);
    })
  )
  .subscribe((users: any) => {
    if (Array.isArray(users)) {
      this.filteredDoctors = users.filter(
        (u: any) => u.role?.name === 'doctor'
      );
    } else if (users && users.data) {
      this.filteredDoctors = users.data.filter(
        (u: any) => u.role?.name === 'doctor'
      );
    } else {
      this.filteredDoctors = [];
    }
  });
    // Load UHID
    this.loadTodaysUHID();

    // Detect UHID input directly
    this.appointmentForm
      .get('patient_name')
      ?.valueChanges.pipe(
        debounceTime(300),
        switchMap((patient_name: string) => {
          if (this.manuallySelected) return of({ uhids: [] });
          return patient_name && patient_name.length > 2
            ? this.uhidService.getPatientByName(patient_name)
            : of({ uhids: [] });
        })
      )
      .subscribe((response: any) => {
        if (this.manuallySelected) return;

        this.filteredPatients = response?.uhids
          ? response.uhids
          : response.data || [];
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    // uhid fikter
    this.appointmentForm
      .get('uhid')!
      .valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length <= 2) {
            this.manuallySelected = false; // ✅ reset
            this.filteredPatients = [];
            this.showSuggestions = false;
            return of({ uhids: [] });
          }

          if (this.manuallySelected) return of({ uhids: [] });

          const filters: { [key: string]: string } = { uhid: value };
          // Add optional filters...
          return this.uhidService.getPatientByFilters(filters);
        })
      )
      .subscribe((res: any) => {
        this.filteredPatients = res?.uhids || [];
        // console.log('filtered', this.filteredPatients);
        this.showSuggestions = this.filteredPatients.length > 0;
      });

    const initialDate = this.appointmentForm.get('date')?.value;
    if (initialDate) {
      this.handleDateChange(initialDate);
    }

    this.appointmentForm.get('date')?.valueChanges.subscribe((date) => {
      this.handleDateChange(date);
    });

    // If the doctor is already selected AND date is pre-filled
    const initialDoctor = this.selectedDoctor;
    // const initialDate = this.appointmentForm.get('date')?.value;
    this.selectedDate = initialDate;
    if (initialDoctor?._id && initialDate) {
      this.fetchBookedTimes(initialDoctor._id);
    }

    this.appointmentForm.get('source')?.valueChanges.subscribe((value) => {
      const doctorControl = this.appointmentForm.get('doctor_name');
      const platformControl = this.appointmentForm.get('platform_name');
      const staffControl = this.appointmentForm.get('staffId');

      // Reset validators
      doctorControl?.clearValidators();
      platformControl?.clearValidators();
      staffControl?.clearValidators();

      // Apply conditional validators
      if (value === 'doctor-referral') {
        doctorControl?.setValidators([Validators.required]);
      } else if (value === 'online') {
        platformControl?.setValidators([Validators.required]);
      } else if (value === 'staff-referral') {
        staffControl?.setValidators([Validators.required]);
      }

      doctorControl?.updateValueAndValidity();
      platformControl?.updateValueAndValidity();
      staffControl?.updateValueAndValidity();
    });
  }

  selectedDateDay: string = '';
  handleDateChange(date: string) {
    this.selectedDate = date;
    const day = this.getDayOfWeek(date);
    console.log('day', day);
    this.selectedDateDay = day;

    const doctor = this.selectedDoctor;
    if (doctor?._id && date) {
      this.fetchBookedTimes(doctor._id);
    }
  }

  getDayOfWeek(date: string): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[new Date(date).getDay()];
  }

  // fetchAllAppointments(page: number = 1): void {
  //   this.opdservice.getopdappointmentapis(page).subscribe({
  //     next: (res: any) => {
  //       const today = new Date().toISOString().slice(0, 10); // e.g. "2025-07-03"

  //       const appointments = res.data?.appointments;
  //       console.log("appointment", appointments);
  //       const todayAppointments = appointments.filter((appointment: any) => {
  //         const appointmentDate = new Date(appointment.date)
  //           .toISOString()
  //           .slice(0, 10);
  //         return appointmentDate === today;
  //       });

  //       this.bookedSlots.push(
  //         ...todayAppointments.map((appointment: any) => appointment.time)
  //       );

  //       const currentPage = res.data?.current_page;
  //       const lastPage = res.data?.last_page;

  //       if (currentPage < lastPage) {
  //         this.fetchAllAppointments(currentPage + 1); // Fetch next page
  //       } else {
  //         console.log('All booked slots for today:', this.bookedSlots);
  //       }
  //     },
  //     error: (err: any) => {
  //       console.error('Failed to fetch appointments:', err);
  //     },
  //   });
  // }

  selectDoctor(doctor: any) {
    console.log(doctor);
    this.selectedDoctor = doctor;
    this.appointmentForm.patchValue({ Consulting_Doctor: doctor._id });
    this.doctorSearchControl.setValue(doctor.name, { emitEvent: false });
    this.showDoctorSuggestions = false;

    const id = doctor?._id;
    const selectedDateRaw = this.appointmentForm.get('date')?.value;

    if (id && selectedDateRaw) {
      // this.fetchBookedAppointments(1, selectedDateRaw, id);
      this.fetchBookedTimes(id);
    }
  }

  fetchBookedTimes(id: string) {
    const selectedDateRaw = this.appointmentForm.get('date')?.value;
    if (!id || !selectedDateRaw) return;

    const selectedDate = new Date(selectedDateRaw).toISOString().split('T')[0];
    this.isLoadingSlots = true;

    this.slotservice.getSlots().subscribe(
      (res: any) => {
        // console.log('res', res);

        // Step 1: Get doctor slot for this doctor & selected day
        const doctorSlot = res.find(
          (slot: any) =>
            slot.doctor?._id === id &&
            slot.workingDays.some((wd: any) => wd.day === this.selectedDateDay)
        );

        // console.log("Doctor slot", doctorSlot);

        if (!doctorSlot) {
          this.freeSlots = [];
          this.bookedSlots = [];
          this.isLoadingSlots = false;
          return;
        }

        // Step 2: Find working day
        const daySlots = doctorSlot.workingDays.find(
          (wd: any) => wd.day === this.selectedDateDay
        );

        // console.log("Day slot", daySlots);

        if (!daySlots) {
          this.freeSlots = [];
          this.bookedSlots = [];
          this.isLoadingSlots = false;
          return;
        }

        // Step 3: Generate all possible slots
        const allGeneratedSlots = daySlots.timeSlots.flatMap((ts: any) =>
          this.generateTimeSlots(ts.startTime, ts.endTime, ts.slotDuration)
        );

        console.log('All possible slots:', allGeneratedSlots);

        // TODO: Replace with real API response of already booked slots for this doctor/date
        this.fetchBookedAppointments(
          1,
          selectedDate,
          id,
          (bookedTimes: string[]) => {
            console.log('Booked (normalized):', bookedTimes);

            // Step 4: Update free & booked
            this.bookedSlots = bookedTimes;

            console.log('booked slot', this.bookedSlots);
            this.freeSlots = allGeneratedSlots; // keep all slots (disable booked in template)
            this.isLoadingSlots = false;
          }
        );
      },
      () => {
        this.isLoadingSlots = false;
      }
    );
  }

  generateTimeSlots(start: string, end: string, interval: number): string[] {
    const slots: string[] = [];

    let [startHour, startMin] = start.split(':').map(Number);
    let [endHour, endMin] = end.split(':').map(Number);

    let startDate = new Date();
    startDate.setHours(startHour, startMin, 0, 0);

    let endDate = new Date();
    endDate.setHours(endHour, endMin, 0, 0);

    while (startDate < endDate) {
      const timeString = startDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      slots.push(timeString);
      startDate.setMinutes(startDate.getMinutes() + interval);
    }

    return slots;
  }

  bookedslots: any[] = [];
  fetchBookedAppointments(
    page = 1,
    _dates: string,
    docId: string,
    callback?: (bookedTimes: string[]) => void
  ) {
    if (page === 1) {
      // this.Filteredappointments = [];
      this.bookedslots = [];
    }

    this.opdservice.getopdappointmentapis(page).subscribe((res: any) => {
      const allAppointments = res.data?.appointments || [];
      const totalPages = res.data?.totalPages;

      // Filter by doctor + date
      const matched = allAppointments.filter(
        (a: any) =>
          a.Consulting_Doctor?._id === docId &&
          new Date(a.date).toISOString().split('T')[0] === _dates
      );

      // this.Filteredappointments.push(...matched);
      this.bookedslots.push(
        ...matched.map((a: any) => {
          const [h, m] = a.time.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);

          return d.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        })
      );

      if (page < totalPages) {
        this.fetchBookedAppointments(page + 1, _dates, docId, callback);
      } else {
        if (callback) {
          callback(this.bookedslots);
        }
      }
    });
  }

  selectTime(time: string) {
    this.appointmentForm.patchValue({ time });
  }

  hideSuggestionsLater() {
    setTimeout(() => {
      this.showDoctorSuggestions = false;
    }, 200); // delay so click can register before hiding
  }

  // uhid fo toadys
  showUHIDDropdown: boolean = false;
  uhidTodayRecords: any[] = [];
  loadTodaysUHID(): void {
    const today = new Date().toISOString().split('T')[0];

    this.uhidService.getUhid(1, 100, `dor=${today}`).subscribe(
      (res) => {
        this.uhidTodayRecords = res.uhids ? res.uhids : res.data;

        console.log("Today's UHID Records:", this.uhidTodayRecords);
      },
      (err) => {
        console.error("Error loading today's UHID:", err);
      }
    );
  }

  selectPatientFromUHID(record: any): void {
    this.selectPatient(record);
    this.showUHIDDropdown = false;
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  selectPatient(patient: any) {
    this.patientId = patient._id;
    this.manuallySelected = true; // block the valueChanges logic temporarily

    this.appointmentForm.patchValue({
      patient_name: patient.patient_name,
      caseType: 'old',
      mobile_no: patient.mobile_no,
      emailAddress: patient.emailAddress,
      uhid: patient.uhid,
      status: patient.status,
      gender: patient.gender,
      dob: patient.dob ? this.formatDate(new Date(patient.dob)) : '',
      age: patient.age,
      area: patient.area,
      pincode: patient.pincode,
    });

    this.showSuggestions = false;
    this.filteredPatients = [];

    // Allow enough time for patchValue to settle
    setTimeout(() => {
      this.manuallySelected = false;
    }, 500);
  }

  // Update on user interaction instead
  onPatientInput() {
    if (this.editMode) {
      this.filteredPatients = [];
      return;
    }

    const name = this.appointmentForm.get('patient_name')?.value || '';

    // Reset only when user types different name
    if (this.manuallySelected && name.length <= 2) {
      this.manuallySelected = false;
    }

    if (name.length > 2) {
      this.showSuggestions = true;
    } else {
      this.filteredPatients = [];
      this.showSuggestions = false;
    }
  }

  hideSuggestionsWithDelay(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  matchUhid: string = '';

  loadappointment(appointmetnid: string) {
    this.appointments = [];
    this.opdservice.getOpdAppointmentbyid(appointmetnid).subscribe((res) => {
      console.log('response', res);
      this.appointments = res.data || [];

      const opdappointments = res.data || [];

      const uhid = opdappointments.uhid?._id;
      console.log(
        '🚀 ~ OpdappointmentComponent ~ opdappointments:',
        opdappointments
      );
      if (uhid) {
        this.matchUhid = uhid;
        this.fetchAllAppointments(1, uhid);
      }

      if (opdappointments) {
        const isoDate = new Date(
          opdappointments.date || opdappointments.formattedDate
        );
        const formattedDate = isoDate.toISOString().split('T')[0];

        let time = opdappointments.time;
        if (time && (time.includes('AM') || time.includes('PM'))) {
          const [timeStr, modifier] = time.split(' ');
          let [hours, minutes] = timeStr.split(':');
          hours = parseInt(hours, 10).toString();

          if (modifier === 'PM' && hours !== '12') {
            hours = (parseInt(hours, 10) + 12).toString();
          }
          if (modifier === 'AM' && hours === '12') {
            hours = '00';
          }
          time = `${hours.padStart(2, '0')}:${minutes}`;
        }

        // console.log('doctors:', this.doctors);
        console.log(
          'patching Consulting_Doctor:',
          opdappointments.Consulting_Doctor?._id
        );

        if (this.editMode) {
          this.appointmentForm.patchValue({
            token_number: opdappointments.token_number,
          });
          this.patientId = opdappointments.uhid?._id;
        }

        this.appointmentForm.patchValue({
          patient_name: opdappointments.uhid?.patient_name,
          caseType: 'old',
          mobile_no: opdappointments.uhid?.mobile_no,
          emailAddress: opdappointments.emailAddress,
          Consulting_Doctor: opdappointments.Consulting_Doctor?._id,
          date: formattedDate,
          dob: opdappointments.uhid?.dob
            ? this.formatDate(new Date(opdappointments.uhid?.dob))
            : '',
          gender: opdappointments.uhid?.gender,
          area: opdappointments.uhid?.area || '',
          pincode: opdappointments.uhid?.pincode || '',
          time: time,
          remarks: opdappointments.remarks,
          uhid: opdappointments.uhid?.uhid,
          status: opdappointments.status,
          payment_status: opdappointments.payment_status,
          queue_status: opdappointments.queue_status,
          source: opdappointments.source,
          platform_name: opdappointments.platform_name,
          staffId: opdappointments.staffId,
          staff_name: opdappointments.staff_name,
          doctor_name: opdappointments.doctor_name,
          time_slot: opdappointments.time_slot,
          checkin_time: opdappointments.checkin_time
            ? this.formatDateTime(new Date(opdappointments.checkin_time))
            : '',
          consultation_start: opdappointments.consultation_start
            ? this.formatDateTime(new Date(opdappointments.consultation_start))
            : '',
          consultation_end: opdappointments.consultation_end
            ? this.formatDateTime(new Date(opdappointments.consultation_end))
            : '',
          notes: opdappointments.notes,
        });

        this.doctorSearchControl.setValue(
          opdappointments.Consulting_Doctor?.name || ''
        );
      } else {
        console.warn('OPD Case not found for ID:', appointmetnid);
      }
    });
  }

  fetchAllAppointments(page = 1, uhidid: string): void {
    if (page === 1) {
      this.Filteredappointments = []; // Clear before new search
    }

    this.opdservice.getopdappointmentapis(page).subscribe((res: any) => {
      const allAppointments = res.data?.appointments || [];
      const totalPages = res.data?.totalPages;

      console.log('allll', allAppointments);

      const matched = allAppointments.filter(
        (a: any) => a.uhid?._id === uhidid
      );
      this.Filteredappointments.push(...matched);

      if (page < totalPages) {
        this.fetchAllAppointments(page + 1, uhidid);
      } else {
        this.Filteredappointments.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        console.log('Final matched appointments:', this.Filteredappointments);
      }
    });
  }

  calculateAge(dob: Date): { years: number; months: number; days: number } {
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    // Adjust days and months if negative
    if (days < 0) {
      months--;
      // Get days in the previous month
      const prevMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += prevMonth;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  reset: boolean = false;
  resetForm(): void {
    const now = new Date();
    this.reset = true;

    this.appointmentForm.reset({
      patient_name: '',
      Consulting_Doctor: '',
      mobile_no: '',
      emailAddress: '',
      remarks: '',
      status: '',
      date: this.formatDate(now),
      token_number: '',
      department: '678094536754',
      branch: '670976543657',
      staff_assigned: '673421098765',
      payment_status: 'pending',
      called_by: '672310954365',
      queue_status: '',
      time_slot: '',
      reschedule_count: '',
      checkin_time: '',
      consultation_start: '',
      consultation_end: '',
      cancellation_reason: '',
      source: '',
      is_followup: false,
      followup_for: '654323456786',
      notes: '',
      platform_name: '',
      staffId: '',
      staff_name: '',
      doctor_name: '',
      time: this.getRoundedTime(now),
      uhid: '',
      gender: '',
      dob: '',
      age: '',
      caseType: '',
      dot: this.formatTime(now),
      dor: this.formatDate(now),
      area: '',
      pincode: '',
    });
    this.doctorSearchControl.setValue('');
  }

  async onSubmit(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
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

    // if (!this.editMode && !this.patientId) {
    //   const generatedToken = this.generateToken();
    //   this.appointmentForm.patchValue({ token_number: generatedToken });
    // }

    try {
      const formData = this.appointmentForm.value;

      let uhid = formData.uhid; // May already be an existing UHID ID
      let uhidId = this.patientId || '';

      // 🧠 If patient is *not selected* from suggestion, create new UHID
      // if (!this.manuallySelected || typeof uhidId !== 'string') {

      if (!this.editMode && !uhidId) {
        // const generatedUhid = this.generateUHID(); // Implement this if not yet defined

        const uhidPayload = {
          patient_name: formData.patient_name,
          mobile_no: formData.mobile_no,
          email: formData.email,
          gender: formData.gender,
          age: formData.age,
          dob: formData.dob,
          area: formData.area,
          city: formData.city,
          pincode: formData.pincode,
          address: formData.address,
          dor: formData.dor,
          dot: formData.dot,
          uhid: formData.uhid,
        };

        const uhidResponse: any = await firstValueFrom(
          this.uhidService.postuhid(uhidPayload)
        );
        console.log(
          '🚀 ~ OpdappointmentComponent ~ onSubmit ~ uhidResponse:',
          uhidResponse
        );
        uhid = uhidResponse?.data?.uhid || uhidResponse?.uhid;
        uhidId = uhidResponse?.data?._id || uhidResponse?._id;
        console.log(
          '🚀 ~ OpdappointmentComponent ~ onSubmit ~ uhidId:',
          uhidId
        );
      }

      // 👇 Now post the appointment
      const appointmentPayload: any = {
        uhid: uhidId,
        Consulting_Doctor:
          formData.Consulting_Doctor?._id || formData.Consulting_Doctor,
        date: formData.date,
        time: formData.time,
        remarks: formData.remarks,
        status: formData.status,
        token_number: formData.token_number,
        department: formData.department,
        branch: formData.branch,
        patient_name: formData.patient_name,
        emailAddress: formData.emailAddress,
        staff_assigned: formData.staff_assigned,
        payment_status: formData.payment_status,
        queue_status: formData.queue_status,
        time_slot: formData.time_slot,
        reschedule_count: formData.reschedule_count,
        checkin_time: formData.checkin_time,
        consultation_start: formData.consultation_start,
        consultation_end: formData.consultation_end,
        cancellation_reason: formData.cancellation_reason,
        source: formData.source,
        is_followup: formData.is_followup,
        followup_for: formData.followup_for,
        notes: formData.notes,
      };

      switch (formData.source) {
        case 'staff-referral':
          appointmentPayload.staffId = formData.staffId?.trim();
          appointmentPayload.staff_name = formData.staff_name?.trim();
          break;

        case 'doctor-referral':
          appointmentPayload.doctor_name = formData.doctor_name?.trim();
          break;

        case 'online':
          appointmentPayload.platform_name = formData.platform_name?.trim();
          break;
      }

      if (this.editMode && this.Appointmentid) {
        // 🔄 Update Mode
        await firstValueFrom(
          this.opdservice.updateopdappointmentapis(
            this.Appointmentid,
            appointmentPayload
          )
        );
        Swal.fire({
          icon: 'success',
          title: 'Appointment Updated',
          text: 'OPD Appointment updated successfully.',
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
      } else {
        // ✅ Create Mode
        await firstValueFrom(
          this.opdservice.postopdappointmentapis(appointmentPayload)
        );
        Swal.fire({
          icon: 'success',
          title: 'Appointment Created',
          text: 'UHID and OPD Appointment created successfully.',
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

      this.appointmentForm.reset();
      this.router.navigateByUrl('/opd/opdappointmentlist');
    } catch (error: any) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text:
          error?.error?.message || 'An error occurred while saving the data.',
        customClass: {
          popup: 'hospital-swal-popup',
          title: 'hospital-swal-title',
          htmlContainer: 'hospital-swal-text',
          confirmButton: 'hospital-swal-button',
        },
      });
    }
  }

  onDateSelected(date: string) {
    this.appointmentForm.get('date')?.setValue(date);
  }

  onTimeSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedTime = inputElement.value;

    this.appointmentForm.get('time')?.setValue(selectedTime);
  }

  generateUHID(): string {
    const date = new Date();
    return `UHID-${date.getFullYear()}${
      date.getMonth() + 1
    }${date.getDate()}-${Math.floor(Math.random() * 1000000)}`;
  }

  generateToken(): string {
    const now = new Date();
    const dateCode = `${now.getFullYear()}${
      now.getMonth() + 1
    }${now.getDate()}`;

    const tokenKey = `${dateCode}`; // unique key per day
    const lastToken = localStorage.getItem(tokenKey);
    let nextNumber = lastToken ? parseInt(lastToken, 10) + 1 : 1;

    if (nextNumber > 999) nextNumber = 1; // reset or handle overflow

    localStorage.setItem(tokenKey, nextNumber.toString());

    const paddedNum = nextNumber.toString().padStart(3, '0');
    return `${paddedNum}`;
  }

  formatDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  onTimeChange(selectedTime: string): void {
    // console.log('Selected Time:', selectedTime);

    if (!selectedTime) return;

    // if (this.bookedSlots.includes(selectedTime)) {
    //   alert('Selected time is already booked. Please choose another time.');
    //   console.log('selected time is already booked');
    //   return;
    // }

    let [hours, minutes] = selectedTime.split(':').map(Number);

    const roundedMinutes = Math.round(minutes / 5) * 5;
    if (roundedMinutes === 60) {
      hours = (hours + 1) % 24;
      minutes = 0;
    } else {
      minutes = roundedMinutes;
    }

    const now = new Date();
    now.setHours(hours, minutes, 0, 0);

    const startTime = new Date(now);
    const endTime = new Date(startTime);
    const checkinTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + 5);
    checkinTime.setMinutes(startTime.getMinutes() - 1);

    const formatTime = (d: Date) => d.toTimeString().slice(0, 5);
    const formatDateTime = (d: Date) =>
      `${this.formatDate(d)} ${formatTime(d)}`;

    const timeSlot = `${formatTime(startTime)} - ${formatTime(endTime)}`;

    this.appointmentForm.patchValue({
      time: formatTime(startTime),
      time_slot: timeSlot,
      consultation_start: formatDateTime(startTime),
      consultation_end: formatDateTime(endTime),
      checkin_time: formatDateTime(checkinTime),
    });

    // console.log('Form updated with time slot:', timeSlot);
  }

  getFormattedTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  }
}
