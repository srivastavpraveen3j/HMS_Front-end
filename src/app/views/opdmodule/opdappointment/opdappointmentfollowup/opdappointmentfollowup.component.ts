import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { CustomappointmenttimepickerComponent } from '../../../../component/customappointmenttimepicker/customappointmenttimepicker.component';
import { OpdService } from '../../opdservice/opd.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-opdappointmentfollowup',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './opdappointmentfollowup.component.html',
  styleUrl: './opdappointmentfollowup.component.css',
})
export class OpdappointmentfollowupComponent {
  showPicker: boolean = false;
  value: string = '';
  isDisabled = false;
  currentPage = 1;
  totalPages = 1;
  recordsPerPage: number = 10;
  paginatedAppointments: any[] = [];
  pageSize = 10;
  doctorFilter: string = '';
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';
  filteredAppointment: any[] = [];

  startTime: string = '';
  endTime: string = '';

  onChange = (value: string) => {};
  onTouched = () => {};

  @Output() dateSelected = new EventEmitter<string>();

  calendarForm: FormGroup = new FormGroup({
    month: new FormControl(new Date().getMonth()),
    year: new FormControl(new Date().getFullYear()),
  });

  years: number[] = [];
  calendarDays: (number | null)[] = [];
  months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  selectedDate: number = new Date().getDate();
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();
  formattedDate: string = '';
  showCalendar: boolean = true;
  showTimePicker: boolean = true;
  selectedHour: number = 1;
  selectedMinute: number = 0;
  period: 'AM' | 'PM' = 'AM';
  formattedTime: string = '';
  hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 12
  minutes = Array.from({ length: 12 }, (_, i) => i * 5); // [0, 5, 10, ..., 55
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  appointmentCountMap: { [date: string]: number } = {};
  appointmentTimeMap: { [hour: number]: number[] } = {}; // for hour => minutes[]
  selectedAppointmentTimes: any[] = [];
  hourlyAppointmentCount: { [hour: number]: number } = {};

  constructor(private appointment: OpdService) {}

  ngOnInit() {
    this.initializeYears();
    this.calendarForm.patchValue({
      month: this.selectedMonth,
      year: this.selectedYear,
    });
    this.updateCalendar();
    this.updateFormattedDate();
    this.setCurrentTime();
    // this.getAppointment();
    this.getAllAppointments();

    const today = new Date();
    const hours = today.getHours().toString().padStart(2, '0');
    const minutes = today.getMinutes().toString().padStart(2, '0');
    this.startTime = `${hours}:${minutes}`;
    this.endTime = `${(today.getHours() + 1)
      .toString()
      .padStart(2, '0')}:${minutes}`;
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;
  }

  // ==> Get all appointments with pagination
  getAllAppointments(page: number = 1, accumulated: any[] = []) {
    this.appointment.getopdappointmentapis(page, 10, '').subscribe({
      next: (response) => {
        // console.log(response);
        const appointments = response.data?.appointments || [];
        // console.log(`Fetched page ${response.data?.page} of ${response.data?.totalPages}`);
        const combinedAppointments = [...accumulated, ...appointments];

        const currentPage = parseInt(response.data?.page, 10);
        const totalPages = parseInt(response.data.totalPages, 10);

        if (currentPage < totalPages) {
          this.getAllAppointments(currentPage + 1, combinedAppointments);
        } else {
          this.appointments = combinedAppointments;
          console.log('All Appointments:', this.appointments);

          this.appointmentCountMap = {};
          for (const app of this.appointments) {
            const dateStr = new Date(app.date).toISOString().split('T')[0];
            if (!this.appointmentCountMap[dateStr]) {
              this.appointmentCountMap[dateStr] = 0;
            }
            this.appointmentCountMap[dateStr]++;
          }
        }
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
      },
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  setFilterType(type: string) {
    this.activeFilter = type;
    this.currentPage = 1;

    if (type === 'today') {
      const today = new Date();
      this.formattedDate = today.toISOString().split('T')[0];
    }
  }

  applyFilters() {
    this.currentPage = 1;

    // Update formattedDate when "today" is selected
    if (this.activeFilter === 'today') {
      const today = new Date();
      this.formattedDate = today.toISOString().split('T')[0];
    }
  }

  showSuggestions: boolean = false;
  filteredDoctorSuggestions: string[] = [];

  onDoctorFilterChange() {
    const query = this.doctorFilter.toLowerCase();

    // Filter all unique doctor names
    this.filteredDoctorSuggestions = this.getAllDoctors().filter((name) =>
      name.toLowerCase().includes(query)
    );
  }

  hideSuggestions() {
    // Delay to allow click selection before hiding
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectDoctor(name: string) {
    this.doctorFilter = name;
    this.showSuggestions = false;
    this.currentPage = 1;
    this.getAppointmentCountByDate(this.selectedDate);
    this.getAppointmentCountByTime(this.formattedDate);
  }

  clearDoctorFilter() {
    this.doctorFilter = '';
    this.filteredDoctorSuggestions = [];
    this.currentPage = 1;
  }

  getAllDoctors(): string[] {
    const doctors = this.appointments
      .map((a) => a.Consulting_Doctor?.name)
      .filter((name, i, self) => name && self.indexOf(name) === i);
    return doctors.sort();
  }

  getFilteredAppointmentsForSelectedDate() {
    const appointments = this.getAppointmentsForSelectedDate();
    if (!this.doctorFilter?.trim()) return appointments;

    return appointments.filter((a) =>
      a.Consulting_Doctor?.name
        ?.toLowerCase()
        .includes(this.doctorFilter.toLowerCase())
    );
  }

  // Date Calender
  writeValue(value: string): void {
    this.value = value;
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      this.selectedYear = year;
      this.selectedMonth = month - 1;
      this.selectedDate = day;
      this.calendarForm.patchValue({
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      this.updateCalendar();
      this.updateFormattedDate();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  prevMonth() {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.calendarForm.patchValue({
      month: this.selectedMonth,
      year: this.selectedYear,
    });
    this.updateCalendar();
  }

  nextMonth() {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.calendarForm.patchValue({
      month: this.selectedMonth,
      year: this.selectedYear,
    });
    this.updateCalendar();
  }

  onMonthOrYearChange() {
    this.selectedMonth = this.calendarForm.get('month')?.value;
    this.selectedYear = this.calendarForm.get('year')?.value;
    this.updateCalendar();
  }

  updateCalendar() {
    const firstDay = new Date(
      this.selectedYear,
      this.selectedMonth,
      1
    ).getDay();
    const daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth + 1,
      0
    ).getDate();
    this.calendarDays = Array(firstDay)
      .fill(null)
      .concat([...Array(daysInMonth).keys()].map((i) => i + 1));
  }

  updateFormattedDate() {
    const month = (this.selectedMonth + 1).toString().padStart(2, '0');
    const day = this.selectedDate.toString().padStart(2, '0');
    const year = this.selectedYear;

    this.value = `${year}-${month}-${day}`;
    this.formattedDate = `${day} ${this.months[this.selectedMonth]} ${year}`;

    this.onChange(this.value);
  }

  setDate(date: number): void {
    this.selectedDate = date;
    this.currentPage = 1;

    this.formattedDate = `${this.selectedYear}-${(this.selectedMonth + 1)
      .toString()
      .padStart(2, '0')}-${date.toString().padStart(2, '0')}`;

    console.log('date', this.formattedDate);
    this.getAppointmentCountByTime(this.formattedDate);
  }

  initializeYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 61 }, (_, i) => currentYear - 50 + i);
  }

  selectToday() {
    const today = new Date();
    this.selectedDate = today.getDate();
    this.selectedMonth = today.getMonth();
    this.selectedYear = today.getFullYear();
    this.calendarForm.patchValue({
      month: this.selectedMonth,
      year: this.selectedYear,
    });
    this.updateCalendar();
    this.setDate(this.selectedDate);
  }

  show() {
    const showTimePicker = true;
    this.showPicker = showTimePicker;
  }

  // Time Picker
  setCurrentTime() {
    const now = new Date();
    let hour = now.getHours();
    this.period = hour >= 12 ? 'PM' : 'AM';
    this.selectedHour = hour % 12 || 12;
    this.selectedMinute = Math.round(now.getMinutes() / 5) * 5;
    this.updateFormattedTime();
  }

  // setHour(hour: number) {
  //   this.selectedHour = hour;
  //   this.closePicker();
  // }

  setHour(hour: number) {
    this.selectedHour = hour;
    this.selectedMinute = -1; // clear previous minute selection
    this.updateFormattedTime();
  }

  setMinute(minute: number) {
    this.selectedMinute = minute;
    this.selectedHour = -1;
    this.closePicker();
  }

  setPeriod(period: any) {
    this.period = period;
    this.closePicker();
  }

  updateFormattedTime() {
    const hour =
      this.selectedHour >= 0
        ? this.selectedHour.toString().padStart(2, '0')
        : '00';
    const minute =
      this.selectedMinute >= 0
        ? this.selectedMinute.toString().padStart(2, '0')
        : '00';
    this.formattedTime = `${hour}:${minute} ${this.period}`;
  }

  closePicker() {
    this.updateFormattedTime();
    // this.showTimePicker = false;
  }

  // getAppointmentsForSelectedDate(): any[] {
  //   let filtered = [];

  //    if (this.activeFilter === 'today') {
  //      const today = new Date().toISOString().split('T')[0];
  //      filtered = this.appointments.filter((patient) => {
  //        const createdAt = patient?.createdAt || patient?.created_at;
  //        return (
  //          createdAt &&
  //          new Date(createdAt).toISOString().split('T')[0] === today
  //        );
  //      });
  //      this.filteredAppointment = filtered;
  //    }else if (this.activeFilter === 'dateRange' && this.startDate && this.endDate) {
  //     const start = new Date(this.startDate);
  //     const end = new Date(this.endDate);
  //     end.setHours(23, 59, 59, 999); // include full end day

  //     filtered = this.appointments.filter((appointment: any) => {
  //       const createdAt =
  //         appointment?.createdAt ||
  //         appointment?.created_at ||
  //         appointment?.date;
  //       if (!createdAt) return false;
  //       const date = new Date(createdAt);
  //       return date >= start && date <= end;
  //     });
  //      this.filteredAppointment = filtered;
  //   }
  //   else if (this.activeFilter === 'timeRange' && this.startTime && this.endTime) {
  //     const today = new Date().toISOString().split('T')[0];

  //     filtered = this.appointments.filter((appointment: any) => {
  //       const createdAt = appointment?.createdAt || appointment?.created_at;
  //       if (!createdAt) return false;

  //       const dateObj = new Date(createdAt);
  //       const dateStr = dateObj.toISOString().split('T')[0];
  //       const timeStr = dateObj.toTimeString().split(' ')[0]; // "HH:MM:SS"

  //       // Only today’s date
  //       if (dateStr !== today) return false;

  //       const [apptHour, apptMin] = timeStr.split(':').map(Number);
  //       const [startHour, startMin] = this.startTime.split(':').map(Number);
  //       const [endHour, endMin] = this.endTime.split(':').map(Number);

  //       const apptTime = apptHour * 60 + apptMin;
  //       const startTime = startHour * 60 + startMin;
  //       const endTime = endHour * 60 + endMin;

  //       return apptTime >= startTime && apptTime <= endTime;
  //     });

  //     this.filteredAppointment = filtered;
  //   } else {
  //     // default to selected formatted date
  //     filtered = this.appointments.filter((appointment: any) => {
  //       const appointmentDateISO = new Date(appointment.date)
  //         .toISOString()
  //         .split('T')[0];
  //       return appointmentDateISO === this.formattedDate;
  //     });
  //   }

  //   // Apply doctor filter BEFORE paginating
  //   const doctorFiltered = !this.doctorFilter?.trim()
  //     ? filtered
  //     : filtered.filter((a) =>
  //         a.Consulting_Doctor?.name
  //           ?.toLowerCase()
  //           .includes(this.doctorFilter.toLowerCase())
  //       );

  //   // Update total pages based on filtered results
  //   this.totalPages = Math.ceil(doctorFiltered.length / this.recordsPerPage);

  //   const startIndex = (this.currentPage - 1) * this.recordsPerPage;
  //   const endIndex = startIndex + this.recordsPerPage;

  //   return doctorFiltered.slice(startIndex, endIndex);
  // }

  getAppointmentsForSelectedDate(): any[] {
    let filtered = [];

    const hasTimeRange =
      this.activeFilter.includes('today') ||
      this.activeFilter.includes('dateRange');
    const filterByTime =
      this.startTime && this.endTime && this.activeFilter === 'timeRange';

    //==> TODAY + optional time filter
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];

      filtered = this.appointments.filter((appointment) => {
        const createdAt = appointment?.createdAt || appointment?.created_at;
        if (!createdAt) return false;

        const dateObj = new Date(createdAt);
        const dateStr = dateObj.toISOString().split('T')[0];

        // Match today's date
        if (dateStr !== today) return false;

        // Optionally filter by time range
        if (this.startTime && this.endTime) {
          const [apptHour, apptMin] = dateObj
            .toTimeString()
            .split(':')
            .map(Number);
          const [startHour, startMin] = this.startTime.split(':').map(Number);
          const [endHour, endMin] = this.endTime.split(':').map(Number);

          const apptTime = apptHour * 60 + apptMin;
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          return apptTime >= startTime && apptTime <= endTime;
        }

        return true;
      });

      this.filteredAppointment = filtered;
    }

    //==> DATE RANGE + optional time filter
    else if (
      this.activeFilter === 'dateRange' &&
      this.startDate &&
      this.endDate
    ) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // include entire end day

      filtered = this.appointments.filter((appointment: any) => {
        const createdAt =
          appointment?.createdAt ||
          appointment?.created_at ||
          appointment?.date;
        if (!createdAt) return false;

        const dateObj = new Date(createdAt);
        if (dateObj < start || dateObj > end) return false;

        // Apply time filter within valid date range
        if (this.startTime && this.endTime) {
          const [apptHour, apptMin] = dateObj
            .toTimeString()
            .split(':')
            .map(Number);
          const [startHour, startMin] = this.startTime.split(':').map(Number);
          const [endHour, endMin] = this.endTime.split(':').map(Number);

          const apptTime = apptHour * 60 + apptMin;
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          return apptTime >= startTime && apptTime <= endTime;
        }

        return true;
      });

      this.filteredAppointment = filtered;
    }

    //==> TimeRange only
    else if (
      this.activeFilter === 'timeRange' &&
      this.startTime &&
      this.endTime
    ) {
      const today = new Date().toISOString().split('T')[0];

      filtered = this.appointments.filter((appointment: any) => {
        const createdAt = appointment?.createdAt || appointment?.created_at;
        if (!createdAt) return false;

        const dateObj = new Date(createdAt);
        const dateStr = dateObj.toISOString().split('T')[0];
        if (dateStr !== today) return false;

        const [apptHour, apptMin] = dateObj
          .toTimeString()
          .split(':')
          .map(Number);
        const [startHour, startMin] = this.startTime.split(':').map(Number);
        const [endHour, endMin] = this.endTime.split(':').map(Number);

        const apptTime = apptHour * 60 + apptMin;
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        return apptTime >= startTime && apptTime <= endTime;
      });

      this.filteredAppointment = filtered;
    }

    //==> Default case 
    else {
      filtered = this.appointments.filter((appointment: any) => {
        const appointmentDateISO = new Date(appointment.date)
          .toISOString()
          .split('T')[0];
        return appointmentDateISO === this.formattedDate;
      });
    }

    //==> Doctor Filter
    const doctorFiltered = !this.doctorFilter?.trim()
      ? filtered
      : filtered.filter((a) =>
          a.Consulting_Doctor?.name
            ?.toLowerCase()
            .includes(this.doctorFilter.toLowerCase())
        );

    // ==> Pagination logic 
    this.totalPages = Math.ceil(doctorFiltered.length / this.recordsPerPage);

    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;

    return doctorFiltered.slice(startIndex, endIndex);
  }

  onDateRangeChange() {
    this.currentPage = 1;
  }

  // getAppointmentsForSelectedDate(): any[] {
  //   let filtered = this.appointments;

  //   if (this.activeFilter === 'today') {
  //     const todayStr = new Date().toISOString().split('T')[0];
  //     filtered = filtered.filter((appointment: any) => {
  //       const appointmentDateISO = new Date(appointment.date)
  //         .toISOString()
  //         .split('T')[0];
  //       return appointmentDateISO === todayStr;
  //     });
  //   } else if (
  //     this.activeFilter === 'dateRange' &&
  //     this.startDate &&
  //     this.endDate
  //   ) {
  //     const start = new Date(this.startDate);
  //     const end = new Date(this.endDate);

  //     filtered = filtered.filter((appointment: any) => {
  //       const date = new Date(appointment.date);
  //       return date >= start && date <= end;
  //     });
  //   } else {
  //     const appointmentDateISO = new Date(this.formattedDate)
  //       .toISOString()
  //       .split('T')[0];
  //     filtered = filtered.filter((appointment: any) => {
  //       return (
  //         new Date(appointment.date).toISOString().split('T')[0] ===
  //         appointmentDateISO
  //       );
  //     });
  //   }

  //   if (this.doctorFilter?.trim()) {
  //     //==> doctor filter
  //     filtered = filtered.filter((a: any) =>
  //       a.Consulting_Doctor?.name
  //         ?.toLowerCase()
  //         .includes(this.doctorFilter.toLowerCase())
  //     );
  //   }

  //   // Pagination logic
  //   this.totalPages = Math.ceil(filtered.length / this.recordsPerPage);
  //   const startIndex = (this.currentPage - 1) * this.recordsPerPage;
  //   const endIndex = startIndex + this.recordsPerPage;

  //   return filtered.slice(startIndex, endIndex);
  // }

  getAppointmentCountByDate(date: number): number {
    // ==> Appointment count of dates
    const fullDateStr = `${this.selectedYear}-${(this.selectedMonth + 1)
      .toString()
      .padStart(2, '0')}-${date.toString().padStart(2, '0')}`;

    // Filter appointments for this exact date
    let selectedAppointments = this.filteredAppointment.filter(
      (appointment: any) => {
        const appointmentDateStr = new Date(appointment.date)
          .toISOString()
          .split('T')[0];
        return appointmentDateStr === fullDateStr;
      }
    );

    // Apply doctor filter
    if (this.doctorFilter?.trim()) {
      selectedAppointments = selectedAppointments.filter((appointment: any) =>
        appointment.Consulting_Doctor?.name
          ?.toLowerCase()
          .includes(this.doctorFilter.toLowerCase())
      );
    }

    return selectedAppointments.length;
  }

  // ==> Appointment count by time
  getAppointmentCountByTime(date: string) {
    const selectedDateStr = new Date(date).toISOString().split('T')[0];

    let selectedAppointments = this.appointments.filter((appointment: any) => {
      const appointmentDate = new Date(appointment.date)
        .toISOString()
        .split('T')[0];
      return appointmentDate === selectedDateStr;
    });

    // Apply doctor filter
    if (this.doctorFilter?.trim()) {
      selectedAppointments = selectedAppointments.filter((appointment: any) =>
        appointment.Consulting_Doctor?.name
          ?.toLowerCase()
          .includes(this.doctorFilter.toLowerCase())
      );
    }

    const appointmentTimes = selectedAppointments.map((a: any) => a.time); // e.g., ['10:05', '13:30']

    const appointmentTimeMap: { [hour: number]: number[] } = {};
    const hourlyAppointmentCount: { [hour: number]: number } = {};

    appointmentTimes.forEach((time: string) => {
      const [hourStr, minuteStr] = time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (!appointmentTimeMap[hour]) {
        appointmentTimeMap[hour] = [];
      }
      appointmentTimeMap[hour].push(minute);

      if (!hourlyAppointmentCount[hour]) {
        hourlyAppointmentCount[hour] = 0;
      }
      hourlyAppointmentCount[hour]++;
    });

    this.appointmentTimeMap = appointmentTimeMap;
    this.hourlyAppointmentCount = hourlyAppointmentCount;

    console.log('Filtered by doctor:', this.doctorFilter);
    console.log('Time Map:', this.appointmentTimeMap);
    console.log('Hourly Count:', this.hourlyAppointmentCount);
  }

  get24Hour(hour: number): number {
    if (this.period === 'AM') {
      return hour === 12 ? 0 : hour;
    } else {
      return hour === 12 ? 12 : hour + 12;
    }
  }
}
