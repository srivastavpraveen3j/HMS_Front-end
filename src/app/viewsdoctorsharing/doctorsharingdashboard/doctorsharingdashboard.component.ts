import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DoctorsharingserviceService } from '../doctorsharingservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctorsharingdashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctorsharingdashboard.component.html',
  styleUrl: './doctorsharingdashboard.component.css',
})
export class DoctorsharingdashboardComponent {
  sharedData: any[] = [];
  userPermissions: any = {};
  uniqueReferringDoctors = new Set<string>();
  uniqueConsultingDoctors = new Set<string>();
  referringSpecialityCount: { [speciality: string]: number } = {};
  consultingSpecialityCount: { [speciality: string]: number } = {};
  count: number = 0;
  searchText: string = '';
  filteredDoctors: any[] = [];
  show: boolean = false;
  consultingSpecialities: Set<string> = new Set();
  activeTab: 'OPD' | 'IPD' = 'OPD';
  activeFilter = 'today';
  startDate: string = '';
  endDate: string = '';

  recordsPerPage = 10;
  currentPage = 1;
  totalPages = 0;
  paginatedDoctors: any[] = [];

  constructor(
    private doctorsharingService: DoctorsharingserviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    this.startDate = todayString;
    this.endDate = todayString;

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'sharedPatientCases'
    );
    this.userPermissions = uhidModule?.permissions || {};

    this.getData();
  }

  getData(page: number = 1) {
    this.doctorsharingService
      .getSharedData(page, this.recordsPerPage)
      .subscribe((res) => {
        console.log(res);
        this.totalPages = res.data?.totalPages;
        this.sharedData = res.data?.data || [];
        console.log('Filtered records:', this.sharedData);

        this.applyFilters();
      });
  }

  filterDoctors() {
    const text = this.searchText.toLowerCase();

    this.filteredDoctors = this.sharedData.filter((data) => {
      const consultingName = data.consulting_Doctor?.name?.toLowerCase() || '';
      const referringName = data.referringDoctorId?.name?.toLowerCase() || '';
      const department = data.type?.toLowerCase() || '';

      //==> check if it matches search and active tab
      const matchesSearch =
        consultingName.includes(text) ||
        referringName.includes(text) ||
        department.includes(text);

      const matchesTab = data.type === this.activeTab;

      return matchesSearch && matchesTab;
    });
  }

  showPatient(data: any) {
    if (data.type === 'IPD') {
      this.router.navigate(['/doctorsharinglayout/ipddatasharing'], {
        queryParams: { _id: data._id },
      });
    } else {
      this.router.navigate(['/doctorsharinglayout/opddatasharing'], {
        queryParams: { _id: data._id },
      });
    }
  }

  showDepartment() {
    this.show = !this.show;
  }

  get consultingSpecialityList(): string[] {
    return Array.from(this.consultingSpecialities);
  }

  filterByType(tab: 'OPD' | 'IPD') {
    this.activeTab = tab;
    this.searchText = '';
    this.applyFilters();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateDoctors();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateDoctors();
    }
  }

  setDateFilter(type: 'today' | 'dateRange') {
    this.activeFilter = type;

    if (type === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.startDate = today;
      this.endDate = today;
    }

    this.applyFilters();
  }

  applyFilters() {
    const text = this.searchText.toLowerCase();
    this.currentPage = 1;

    //==> reset all counts
    this.filteredDoctors = [];
    this.consultingSpecialities.clear();
    this.uniqueReferringDoctors.clear();
    this.uniqueConsultingDoctors.clear();
    this.consultingSpecialityCount = {};
    this.referringSpecialityCount = {};
    this.count = 0;

    //==> filter base list by tab and search
    let baseList = this.sharedData.filter((data) => {
      const consultingName = data.consulting_Doctor?.name?.toLowerCase() || '';
      const referringName = data.referringDoctorId?.name?.toLowerCase() || '';
      const department = data.type?.toLowerCase() || '';

      const matchesSearch =
        consultingName.includes(text) ||
        referringName.includes(text) ||
        department.includes(text);

      const matchesTab = data.type === this.activeTab;

      return matchesSearch && matchesTab;
    });

    //==> Apply date filter
    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      baseList = baseList.filter((data) => {
        const createdAt = data.createdAt || data.created_at;
        return (
          createdAt && new Date(createdAt).toISOString().split('T')[0] === today
        );
      });
    } else if (this.activeFilter === 'dateRange') {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      baseList = baseList.filter((data) => {
        const createdAt = data.createdAt || data.created_at;
        const date = new Date(createdAt);
        return date >= start && date <= end;
      });
    }

    //==> Count logic 
    baseList.forEach((data) => {
      const referring = data.referringDoctorId;
      if (referring && referring._id) {
        this.uniqueReferringDoctors.add(referring._id);
        const speciality = referring.speciality || 'Unknown';
        this.referringSpecialityCount[speciality] =
          (this.referringSpecialityCount[speciality] || 0) + 1;
      }

      const consulting = data.consulting_Doctor;
      if (consulting && consulting._id) {
        this.uniqueConsultingDoctors.add(consulting._id);
        const speciality = consulting.speciality || 'Unknown';
        this.consultingSpecialityCount[speciality] =
          (this.consultingSpecialityCount[speciality] || 0) + 1;
        this.consultingSpecialities.add(speciality);
      }
    });

    this.count = Object.keys(this.consultingSpecialityCount).length;
    this.filteredDoctors = baseList;
    this.totalPages = Math.ceil(
      this.filteredDoctors.length / this.recordsPerPage
    );
    this.paginateDoctors();
  }

  paginateDoctors() {
    const start = (this.currentPage - 1) * this.recordsPerPage;
    const end = start + this.recordsPerPage;
    this.paginatedDoctors = this.filteredDoctors.slice(start, end);
  }
}
