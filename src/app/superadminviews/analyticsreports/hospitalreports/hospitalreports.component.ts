import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Define interfaces for type safety
interface Branch {
  name: string;
  revenue: number;
  opd: number;
  ipd: number;
  staff: number;
}

interface Hospital {
  name: string;
  revenue: number;
  patients: number;
  opd: number;
  ipd: number;
  growth: number;
  branches: Branch[];
}

// Define valid period types to use as keys
type PeriodType = 'monthly' | 'quarterly' | 'yearly';

interface ReportsData {
  monthly: Hospital[];
  quarterly: Hospital[];
  yearly: Hospital[];
}

@Component({
  selector: 'app-hospitalreports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './hospitalreports.component.html',
  styleUrls: ['./hospitalreports.component.css']
})
export class HospitalreportsComponent {
  selectedPeriod = new FormControl<PeriodType>('monthly');
  selectedHospitalIndex = new FormControl<number>(0);

  periodOptions = [
    { value: 'monthly' as PeriodType, label: 'Monthly' },
    { value: 'quarterly' as PeriodType, label: 'Quarterly' },
    { value: 'yearly' as PeriodType, label: 'Yearly' }
  ];

  // Sample data with time period variations
  hospitalReportsData: ReportsData = {
    monthly: [
      {
        name: 'PP Maniya Hospital',
        revenue: 1500000,
        patients: 300,
        opd: 180,
        ipd: 120,
        growth: 5.2,
        branches: [
          { name: 'Varacha Branch ', revenue: 600000, opd: 90, ipd: 40, staff: 20 },
          { name: 'Piplod Branch', revenue: 900000, opd: 90, ipd: 80, staff: 25 }
        ]
      },
      {
        name: 'Sunrise Hospital',
        revenue: 1200000,
        patients: 250,
        opd: 150,
        ipd: 100,
        growth: 3.8,
        branches: [
          { name: 'Udhana Branch ', revenue: 700000, opd: 100, ipd: 50, staff: 18 },
          { name: 'Bhestan Branch', revenue: 500000, opd: 50, ipd: 50, staff: 22 }
        ]
      },
      {
        name: 'City Medical Center',
        revenue: 1800000,
        patients: 420,
        opd: 250,
        ipd: 170,
        growth: 6.7,
        branches: [
          { name: 'Citylight Branch', revenue: 1100000, opd: 150, ipd: 120, staff: 35 },
          { name: 'Adajan Branch', revenue: 700000, opd: 100, ipd: 50, staff: 22 }
        ]
      }
    ],
    quarterly: [
      {
        name: 'PP Maniya Hospital',
        revenue: 4500000,
        patients: 950,
        opd: 570,
        ipd: 380,
        growth: 7.5,
        branches: [
          { name: 'Branch A', revenue: 1800000, opd: 270, ipd: 150, staff: 20 },
          { name: 'Branch B', revenue: 2700000, opd: 300, ipd: 230, staff: 25 }
        ]
      },
      {
        name: 'Sunrise Hospital',
        revenue: 3600000,
        patients: 780,
        opd: 480,
        ipd: 300,
        growth: 6.2,
        branches: [
          { name: 'Branch X', revenue: 2100000, opd: 310, ipd: 170, staff: 18 },
          { name: 'Branch Y', revenue: 1500000, opd: 170, ipd: 130, staff: 22 }
        ]
      },
      {
        name: 'City Medical Center',
        revenue: 5400000,
        patients: 1260,
        opd: 750,
        ipd: 510,
        growth: 8.3,
        branches: [
          { name: 'Main Branch', revenue: 3300000, opd: 450, ipd: 360, staff: 35 },
          { name: 'Downtown Branch', revenue: 2100000, opd: 300, ipd: 150, staff: 22 }
        ]
      }
    ],
    yearly: [
      {
        name: 'PP Maniya Hospital',
        revenue: 18000000,
        patients: 3800,
        opd: 2300,
        ipd: 1500,
        growth: 12.4,
        branches: [
          { name: 'Branch A', revenue: 7200000, opd: 1100, ipd: 600, staff: 20 },
          { name: 'Branch B', revenue: 10800000, opd: 1200, ipd: 900, staff: 25 }
        ]
      },
      {
        name: 'Sunrise Hospital',
        revenue: 14400000,
        patients: 3100,
        opd: 1900,
        ipd: 1200,
        growth: 9.5,
        branches: [
          { name: 'Branch X', revenue: 8400000, opd: 1240, ipd: 680, staff: 18 },
          { name: 'Branch Y', revenue: 6000000, opd: 660, ipd: 520, staff: 22 }
        ]
      },
      {
        name: 'City Medical Center',
        revenue: 21600000,
        patients: 5040,
        opd: 3000,
        ipd: 2040,
        growth: 14.2,
        branches: [
          { name: 'Main Branch', revenue: 13200000, opd: 1800, ipd: 1440, staff: 35 },
          { name: 'Downtown Branch', revenue: 8400000, opd: 1200, ipd: 600, staff: 22 }
        ]
      }
    ]
  };

  get allHospitals(): Hospital[] {
    // Get the current period value and ensure it's one of our valid types
    const periodValue = this.selectedPeriod.value;

    // Type guard to ensure we have a valid period key
    if (periodValue && (periodValue === 'monthly' || periodValue === 'quarterly' || periodValue === 'yearly')) {
      return this.hospitalReportsData[periodValue];
    }

    // Default fallback to monthly
    return this.hospitalReportsData.monthly;
  }

  get currentHospital(): Hospital {
    const index = this.selectedHospitalIndex.value ?? 0;
    return this.allHospitals[index] || this.allHospitals[0];
  }

  get hospitalOptions(): {value: number, label: string}[] {
    return this.allHospitals.map((hospital, index) => ({
      value: index,
      label: hospital.name
    }));
  }

  getGrowthClass(growth: number): string {
    return growth > 0 ? 'positive-growth' : 'negative-growth';
  }

  calculateTotalRevenue(): number {
    return this.allHospitals.reduce((sum: number, hospital: Hospital) => sum + hospital.revenue, 0);
  }

  calculateTotalPatients(): number {
    return this.allHospitals.reduce((sum: number, hospital: Hospital) => sum + hospital.patients, 0);
  }
}
