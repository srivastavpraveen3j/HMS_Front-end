import { Component } from '@angular/core';
import { LoaderComponent } from '../../../loader/loader.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SlotmasterService } from '../slotmaster.service';
import { RoleService } from '../../usermaster/service/role.service';

@Component({
  selector: 'app-slotmasterlist',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './slotmasterlist.component.html',
  styleUrls: ['./slotmasterlist.component.css'],
})
export class SlotmasterlistComponent {
  slotForm!: FormGroup;
  slots: any[] = [];
  tableData: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  selectedDoctorName: string = '';
  doctorSearchText: string = '';
  filteredDoctors: any[] = [];
  userPermissions: any = {};
  recordsPerPage: number = 10;
  searchText: string = '';

  constructor(
    private slotservice: SlotmasterService,
    private role: RoleService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'slotMaster'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.slotForm = this.fb.group({
      recordsPerPage: [10],
      searchText: [''],
    });

    this.loadSlots();

    this.slotForm.get('recordsPerPage')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadSlots();
    });
  }

  loadSlots() {
    const limit = this.slotForm.get('recordsPerPage')?.value || 10;
    let search = this.slotForm.get('searchText')?.value || '';

    this.slotservice.getSlots().subscribe({
      next: (res: any) => {
        console.log('Slots full data', res);
        this.slots = res.slots || res;
        this.totalPages = res.totalPages;
        this.tableData = this.transformSlots(this.slots);
        console.log('tabel data', this.tableData);
      },
      error: (error: any) => {
        console.error('Error loading slots:', error);
      },
    });
  }

  previousPage() {
    this.currentPage--;
    this.loadSlots();
  }

  nextPage() {
    this.currentPage++;
    this.loadSlots();
  }

  transformSlots(data: any[]) {
    const result: any[] = [];

    data.forEach((slot) => {
      const doctorName = slot.doctor?.name;

      // Group by startTime+endTime+slotDuration+maxAppointments
      const grouped: { [key: string]: any } = {};

      slot.workingDays.forEach((day: any) => {
        day.timeSlots.forEach((time: any) => {
          const key = `${time.startTime}-${time.endTime}-${time.slotDuration}-${time.maxAppointments}`;

          if (!grouped[key]) {
            grouped[key] = {
              id: slot._id,
              doctor: doctorName,
              days: [],
              startTime: time.startTime,
              endTime: time.endTime,
              slotDuration: time.slotDuration,
              maxAppointments: time.maxAppointments,
              isAvailable: time.isAvailable,
            };
          }
          grouped[key].days.push(day.day);
        });
      });

      // Push grouped data into result
      Object.values(grouped).forEach((g: any) => {
        result.push(g);
      });
    });

    return result;
  }

  onDoctorSearchChange(searchText: string) {
    if (searchText.trim().length === 0) {
      this.filteredDoctors = [];
      this.selectedDoctorName = '';
      this.currentPage = 1;
      this.loadSlots();
      return;
    }

    if (searchText.trim().length < 2) {
      this.filteredDoctors = [];
      return;
    }

    //==> call API when typing
    this.role.getusers(1, 100, searchText).subscribe((res: any) => {
      const doctors = res.filter((u: any) => u.role?.name === 'doctor') || [];
      this.filteredDoctors = doctors;
      // console.log('filtered', this.filteredDoctors);
    });
  }

  onDoctorSelected(selectedDoctorName: string) {
    this.selectedDoctorName = selectedDoctorName;
    this.doctorSearchText = selectedDoctorName;
    this.filteredDoctors = [];
    this.currentPage = 1;
    this.loadSlots();
  }

  editSlot(slotId: string) {
    console.log('id', slotId);
    this.router.navigate(['/master/slotmaster'], {
      queryParams: { id: slotId },
    });
  }
}
