import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomcalendarComponent } from '../../component/customcalendar/customcalendar.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PharmaService } from '../pharma.service';
import { UhidService } from '../../views/uhid/service/uhid.service';
import { PatientOpdpharmabillComponent } from '../../component/opdcustomfiles/patient-opdpharmabill/patient-opdpharmabill.component';
import { RouterModule } from '@angular/router';
import { DaterangeComponent } from '../../views/daterange/daterange.component';
import { IndianCurrencyPipe } from '../../pipe/indian-currency.pipe';

@Component({
  selector: 'app-pharmadashboard',
  standalone: true,
  imports: [
    CommonModule,

    ReactiveFormsModule,
    PatientOpdpharmabillComponent,
    FormsModule,
    RouterModule,

    IndianCurrencyPipe,
  ],
  templateUrl: './pharmadashboard.component.html',
  styleUrl: './pharmadashboard.component.css',
})
export class PharmadashboardComponent implements OnInit {
  doctors: any[] = [];
  filterForm!: FormGroup;
  recordsPerPage: number = 25;
  searchText: string = '';
  pharma: any[] = [];
  currentPage = 1;
  totalPages = 1;
  selectedDept: string = 'inpatientDepartment';
  selectedPatient: any = null;
  uhiddata: any[] = [];
  uhidLoaded = false;
  pharmaLoaded = false;
  activeFilter = 'today'; // 'today' | 'dateRange' | 'all'
  startDate: string = '';
  endDate: string = '';
  filteredCases: any[] = [];

  yourMinDate = new Date(2020, 0, 1);
  yourMaxDate = new Date();
  handleDateRangeChange(event: { startDate: string; endDate: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.applyFilters(); // or apply filtering etc.
  }

  constructor(
    private pharmaservice: PharmaService,
    private uhidservice: UhidService
  ) {}

  userPermissions: any = {};
  opduserPermissions: any = {};

  ngOnInit(): void {
    // load permissions

    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'pharmaceuticalInward'
    );
    const pharmamodule = allPermissions.find(
      (perm: any) => perm.moduleName === 'pharmaceuticalRequestList'
    );
    this.userPermissions = uhidModule?.permissions || {};
    this.opduserPermissions = uhidModule?.permissions || {};

    // load permissions
    const today = new Date().toISOString().split('T')[0];
    this.startDate = today;
    this.endDate = today;

    this.pharmaservice.getPharmareqall().subscribe({
      next: (res) => {
        console.log('Raw Data:', res.data); // Add this
        this.pharma = res.data.filter(
          (item: any) => item.type === 'inpatientDepartment'
        );
        this.enrichAllPharmaWithUHID();
      },
      error: (err) => console.log('Pharma Error:', err),
    });
  }

  checkAndEnrich() {
    if (this.pharmaLoaded && this.uhidLoaded) {
      this.enrichPharmaWithUHID();
      // this.enrichPharmaWithIPDUHID();
      this.applyFilters();
    }
  }

  // enrichPharmaWithUHID() {
  //     if (!this.pharma || !this.uhiddata || !Array.isArray(this.uhiddata)) {
  //     console.warn('⛔ Enrichment skipped: Invalid data');
  //     return;
  //   }

  //   this.pharma = this.pharma.map(pharma => {
  //     const pharmaUHID = String(pharma.uniqueHealthIdentificationId || '').trim();
  //     const matchedPatient = this.uhiddata.find(p => {
  //       const patientId = String(p._id || p.id || '').trim();
  //       return pharmaUHID === patientId;
  //     });

  //     if (matchedPatient) {
  //       return {
  //         ...pharma,
  //         patient_name: matchedPatient.patient_name,
  //         age: matchedPatient.age,
  //         gender: matchedPatient.gender,
  //         uhid: matchedPatient.uhid
  //       };
  //     } else {
  //       console.warn('❌ No match for pharma UHID:', pharmaUHID);
  //       return pharma;
  //     }
  //   });

  //   console.log("✅ Enriched pharma list:", this.pharma);
  // }
  enrichPharmaWithUHID() {
    if (!this.pharma || !this.uhiddata) return;

    this.pharma = this.pharma.map((pharma) => {
      const pharmaUHID = String(
        pharma.uniqueHealthIdentificationId || ''
      ).trim();

      const matchedPatient = this.uhiddata.find((patient) => {
        const patientId = String(patient._id || patient.id || '').trim();
        return patientId === pharmaUHID;
      });

      if (matchedPatient) {
        return {
          ...pharma,
          patient_name: matchedPatient.patient_name,
          age: matchedPatient.age,
          gender: matchedPatient.gender,
          uhid: matchedPatient.uhid,
        };
      } else {
        console.warn('❌ No match for pharma UHID:', pharmaUHID);
        return {
          ...pharma,
          patient_name: '[MISSING]',
          age: '-',
          gender: '-',
          uhid: '-',
        };
      }
    });
  }

  enrichAllPharmaWithUHID() {
    if (!this.pharma || !Array.isArray(this.pharma)) return;

    const enrichedRecords: any[] = [];
    let completed = 0;

    for (const pharma of this.pharma) {
      const uhidId = pharma.uniqueHealthIdentificationId;

      if (!uhidId || typeof uhidId !== 'string' || uhidId.trim() === '') {
        enrichedRecords.push({
          ...pharma,
          patient_name: '[UNKNOWN]',
          age: '-',
          gender: '-',
          uhid: '-',
        });
        completed++;
        continue;
      }

      this.uhidservice.getUhidById(uhidId).subscribe({
        next: (res) => {
          const patient = res?.[0] || res;

          enrichedRecords.push({
            ...pharma,
            patient_name: patient?.patient_name || '[UNKNOWN]',
            age: patient?.age || '-',
            gender: patient?.gender || '-',
            uhid: patient?.uhid || '-',
          });

          completed++;
          if (completed === this.pharma.length) {
            this.pharma = [...enrichedRecords]; // ✅ force Angular update
            this.applyFilters();
          }
        },
        error: (err) => {
          console.error('UHID Fetch Error for ID:', uhidId, err);

          enrichedRecords.push({
            ...pharma,
            patient_name: '[ERROR]',
            age: '-',
            gender: '-',
            uhid: '-',
          });

          completed++;
          if (completed === this.pharma.length) {
            this.pharma = [...enrichedRecords];
            this.applyFilters();
          }
        },
      });
    }
  }

  totalAmount: number = 0;

  applyFilters() {
    let baseList = this.pharma;
    const text = this.searchText.toLowerCase();

    baseList = baseList.filter((data) => {
      const patient = data.patient_name.toLowerCase() || '';
      const uhid = data.uhid;

      return patient.includes(text) || uhid.includes(text);
    });

    if (this.activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      this.filteredCases = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt).toISOString().split('T')[0];
        return patientDate === today;
      });
    } else if (this.activeFilter === 'dateRange') {
      if (!this.startDate || !this.endDate) {
        this.filteredCases = [];
        return;
      }

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);

      this.filteredCases = baseList.filter((patient) => {
        const createdAt = patient?.createdAt || patient?.created_at;
        if (!createdAt) return false;
        const patientDate = new Date(createdAt);
        return patientDate >= start && patientDate <= end;
      });
    } else {
      this.filteredCases = baseList;
    }

    // 🔢 Calculate total amount
    this.totalAmount = this.filteredCases.reduce((sum, item) => {
      return sum + (item.total || 0);
    }, 0);
  }

  viewPatient(patientId: string): void {
    if (!patientId) {
      console.error('No patientId provided');
      return;
    }

    this.pharmaservice.getpharmareqById(patientId).subscribe({
      next: (res) => {
        const pharmaUHID = String(
          res.uniqueHealthIdentificationId || ''
        ).trim();

        const matchedPatient = this.uhiddata.find(
          (p) => String(p._id || '').trim() === pharmaUHID // << ✅ FIXED HERE
        );

        if (matchedPatient) {
          res.patient_name = matchedPatient.patient_name;
          res.age = matchedPatient.age;
          res.gender = matchedPatient.gender;
          res.uhid = matchedPatient.uhid;
          console.log('✅ Enriched modal patient data:', matchedPatient);
        } else {
          console.warn('❌ No match in modal for UHID:', pharmaUHID);
        }

        this.selectedPatient = res;
      },
      error: (err) => {
        console.error('Error fetching patient:', err);
      },
    });
  }

  closeModal(): void {
    this.selectedPatient = null;
  }
}
